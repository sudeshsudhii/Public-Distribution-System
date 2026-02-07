import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os
from datetime import datetime
import json
import time
from collections import defaultdict
import random

MODEL_PATH = "fraud_model.pkl"

class FraudDetector:
    def __init__(self):
        self.model = None
        self.feature_columns = ['quantity', 'time_gap_hours', 'monthly_total', 'shop_frequency', 'region_risk']
        self.is_trained = False
        
        # 🧩 PART 1 — ADD IN-MEMORY STATE
        self.transaction_history = defaultdict(list) # { "BEN123": [ {quantity, timestamp} ] }
        self.shop_history = defaultdict(list)        # { "SHOP01": [ timestamp ] }

    def generate_synthetic_data(self, n=500):
        # Keep synthetic generation for basic model training
        np.random.seed(42)
        n_fraud = int(n * 0.25)
        n_normal = n - n_fraud
        
        data_normal = {
            'quantity': np.random.uniform(3, 12, n_normal),
            'time_gap_hours': np.random.uniform(0.5, 2.0, n_normal) * 720,
            'monthly_total': np.random.uniform(3, 12, n_normal),
            'shop_frequency': np.random.uniform(1, 4, n_normal),
            'region_risk': np.random.uniform(0, 1, n_normal)
        }
        
        data_fraud = {
            'quantity': np.random.uniform(12, 30, n_fraud),
            'time_gap_hours': np.random.uniform(0.1, 0.5, n_fraud) * 720,
            'monthly_total': np.random.uniform(30, 100, n_fraud),
            'shop_frequency': np.random.uniform(4, 10, n_fraud),
            'region_risk': np.random.uniform(1.2, 3, n_fraud)
        }
        
        df = pd.concat([pd.DataFrame(data_normal), pd.DataFrame(data_fraud)], ignore_index=True)
        
        self.min_train_score = -0.5
        self.max_train_score = 0.5
        
        return df

    def train(self):
        print("GENERATING SYNTHETIC DATA...")
        df = self.generate_synthetic_data()
        
        print("TRAINING ISOLATION FOREST MODEL...")
        self.model = IsolationForest(n_estimators=100, contamination=0.25, random_state=42)
        self.model.fit(df[self.feature_columns])
        
        scores = self.model.decision_function(df[self.feature_columns])
        self.min_train_score = scores.min()
        self.max_train_score = scores.max()
        
        self.model.min_score_ = self.min_train_score
        self.model.max_score_ = self.max_train_score
        
        joblib.dump(self.model, MODEL_PATH)
        self.is_trained = True
        print(f"MODEL SAVED TO {MODEL_PATH}")

    def load(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.is_trained = True
            self.min_train_score = getattr(self.model, 'min_score_', -0.5)
            self.max_train_score = getattr(self.model, 'max_score_', 0.5)
        else:
            self.train()

    def predict(self, data):
        """
        data: dict containing feature values + beneficiary_id + shop_id
        Returns: fraud_score (0-1), risk_level, reasons (list)
        """
        if not self.is_trained:
            self.load()

        # 🧩 PART 2 — STORE HISTORY PER REQUEST
        now = datetime.utcnow()
        current_ts = now.timestamp() # Use timestamp for math

        beneficiary_id = data.get("beneficiary_id", "UNKNOWN")
        shop_id = data.get("shop_id", "UNKNOWN")
        quantity = data.get("quantity", 0)
        region_risk = data.get("region_risk", 0.3)

        # Append current transaction to history
        self.transaction_history[beneficiary_id].append({
            "quantity": quantity,
            "timestamp": current_ts,
            "shop_id": shop_id,
            "region_risk": region_risk # Track Region for Zone Hopping
        })
        self.shop_history[shop_id].append(current_ts)

        # 🧩 PART 3 — FEATURE ENGINEERING
        user_txns = self.transaction_history[beneficiary_id]
        shop_txns = self.shop_history[shop_id]

        # Daily Count: Tx in last 24h
        today_txs = [t for t in user_txns if (current_ts - t["timestamp"]) < 86400]
        daily_count = sum(1 for t in today_txs)
        
        # Shop Hopping Check: Count unique shops visited today
        unique_shops_today = len(set(t["shop_id"] for t in today_txs))
        
        # Zone Hopping Check: Count unique regions visited today
        unique_regions_today = len(set(t["region_risk"] for t in today_txs))

        # Monthly Count (kept for logging/future, not used in formula explicitly but good for model input)
        monthly_count = len(user_txns)

        # Time Gap (minutes)
        if len(user_txns) > 1:
            # -2 because -1 is the current one we just added
            last_timestamp = user_txns[-2]["timestamp"]
            time_gap = (current_ts - last_timestamp) / 60
        else:
            time_gap = 999

        # Avg Quantity & Deviation
        avg_quantity = sum(t["quantity"] for t in user_txns) / len(user_txns)
        # Avoid div by zero
        quantity_deviation = abs(quantity - avg_quantity) / avg_quantity if avg_quantity > 0 else 0

        # Shop Frequency (Total txs for this shop in memory)
        shop_frequency = len(shop_txns)
        
        # Random Noise
        random_noise = random.uniform(0.01, 0.05)

        # --- MODEL INPUT ---
        input_data = {
            'quantity': quantity,
            'time_gap_hours': time_gap / 60,
            'monthly_total': monthly_count, 
            'shop_frequency': shop_frequency,
            'region_risk': region_risk
        }
        input_df = pd.DataFrame([input_data])
        for col in self.feature_columns:
            if col not in input_df.columns:
                input_df[col] = 0

        # Raw Model Score
        raw_model_score = self.model.decision_function(input_df[self.feature_columns])[0]
        # Normalize Model Score (-0.5 to 0.5 -> 0 to 1). Higher is safer in raw IF, so we invert logic?
        # IF decision_function: positive = inlier (safe), negative = outlier (fraud).
        # We want 0 = safe, 1 = fraud for our formula.
        # So we invert: 1 (safe) -> 0. -1 (fraud) -> 1.
        # Let's use simple min-max from training
        range_span = self.max_train_score - self.min_train_score
        if range_span == 0: range_span = 1
        norm_score = (raw_model_score - self.min_train_score) / range_span
        model_score = 1.0 - np.clip(norm_score, 0, 1) # 1 = Fraud based on model anomaly

        # 🧩 PART 4 — HYBRID FRAUD SCORE (REAL FIX)
        frequency_risk = min(daily_count / 3, 1) # 3 tx/day = max risk
        quantity_risk_val = min(quantity_deviation, 1)
        time_risk = 1 if time_gap < 10 else 0
        shop_risk = min(shop_frequency / 10, 1) # 10 tx/shop = max shop saturation risk?
        
        # PENALTIES
        hopping_risk = 0.5 if unique_shops_today > 1 else 0
        zone_hopping_risk = 0.6 if unique_regions_today > 1 else 0
        repeat_risk = 0.25 if daily_count > 1 else 0 # Direct penalty for ANY repetition

        fraud_score = (
            0.35 * model_score +
            0.20 * frequency_risk +
            0.15 * quantity_risk_val +
            0.15 * region_risk +
            0.10 * shop_risk +
            0.05 * random_noise +
            hopping_risk +
            zone_hopping_risk +
            repeat_risk
        )

        fraud_score = min(max(fraud_score, 0), 1)

        # 🧩 PART 5 — DYNAMIC RISK LEVEL
        if fraud_score > 0.7:
            risk_level = "HIGH"
        elif fraud_score > 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # 🧩 PART 6 — EXPLAINABLE REASONS
        reasons = []
        
        if unique_regions_today > 1:
            reasons.append(f"Suspicious multi-zone activity ({unique_regions_today} zones)")

        if unique_shops_today > 1:
            reasons.append(f"Suspicious shop hopping detected ({unique_shops_today} shops today)")

        if daily_count > 1:
            reasons.append(f"Repeated claim attempt (Claim #{daily_count} today)")

        if quantity_deviation > 0.3:
            reasons.append(f"Unusual quantity pattern (+{(quantity_deviation*100):.0f}%)")

        if time_gap < 10:
            reasons.append(f"Rapid repeat claim ({int(time_gap)}m gap)")
            
        if region_risk > 0.6:
            reasons.append(f"High-risk region transaction ({region_risk:.2f})")

        return fraud_score, risk_level, reasons
