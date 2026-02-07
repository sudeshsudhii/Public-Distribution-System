require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const blockchainService = require('./services/blockchain');
const aiService = require('./services/ai');
const dbService = require('./services/db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize services
blockchainService.init();

const ipfsService = require('./services/ipfs');

// Routes

// Generic Events Endpoint (for Timeline)
app.get('/events', async (req, res) => {
    try {
        const events = await blockchainService.getEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/events', async (req, res) => {
    try {
        const { eventType, metadata } = req.body;

        // 1. Upload metadata to IPFS
        // Metadata is already JSON string or object. 
        // If string, parse it first to ensure valid JSON structure for IPFS
        let payload = metadata;
        if (typeof metadata === 'string') {
            try {
                payload = JSON.parse(metadata);
            } catch (e) {
                // keep as string if not json
            }
        }

        const ipfsHash = await ipfsService.uploadJSON({
            type: eventType,
            timestamp: Date.now(),
            data: payload
        });

        // 2. Record on Blockchain
        const txResult = await blockchainService.addEvent(eventType, ipfsHash);

        res.json({
            success: true,
            metadataHash: ipfsHash,
            transactionHash: txResult.txHash,
            message: "Event recorded successfully"
        });

    } catch (error) {
        console.error("Event creation failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// -- In-Memory State for PDS Stock & Quota --
// Initialize with default values. 
// In a real app, this would be in a DB.
const INITIAL_SHOP_STOCK = {
    "SHOP-001": { rice: 500, wheat: 400, sugar: 200 },
    "SHOP-002": { rice: 300, wheat: 250, sugar: 120 },
    "SHOP-003": { rice: 200, wheat: 180, sugar: 80 },
    "SHOP-004": { rice: 150, wheat: 120, sugar: 60 },
    "SHOP-005": { rice: 100, wheat: 90, sugar: 40 }
};

const MONTHLY_QUOTA = {
    rice: 20,
    wheat: 15,
    sugar: 5
};

// Mutable state
let shopStock = JSON.parse(JSON.stringify(INITIAL_SHOP_STOCK));
let beneficiaryUsage = {}; // { "BEN-ID": { rice: 0, wheat: 0, sugar: 0 } }

// Helper to get or init ben usage
const getBenUsage = (benId) => {
    if (!beneficiaryUsage[benId]) {
        beneficiaryUsage[benId] = { rice: 0, wheat: 0, sugar: 0 };
    }
    return beneficiaryUsage[benId];
};

// -- PDS Endpoints --

// Get Stock for all shops
app.get('/pds/stock', (req, res) => {
    res.json(shopStock);
});

// Get specific shop stock
app.get('/pds/stock/:shopId', (req, res) => {
    const { shopId } = req.params;
    res.json(shopStock[shopId] || {});
});

// Get Beneficiary Usage
app.get('/pds/beneficiary/:id', (req, res) => {
    const { id } = req.params;
    const usage = getBenUsage(id);
    res.json({
        id,
        usage,
        quota: MONTHLY_QUOTA,
        remaining: {
            rice: Math.max(0, MONTHLY_QUOTA.rice - usage.rice),
            wheat: Math.max(0, MONTHLY_QUOTA.wheat - usage.wheat),
            sugar: Math.max(0, MONTHLY_QUOTA.sugar - usage.sugar)
        }
    });
});

// Admin Refill Stock
app.post('/pds/refill', (req, res) => {
    const { shopId, commodity, quantity } = req.body;

    if (!shopStock[shopId]) {
        return res.status(404).json({ success: false, message: "Shop not found" });
    }

    // Validate commodity (case insensitive?) - assuming lowercase from frontend
    const comm = commodity.toLowerCase();
    if (shopStock[shopId][comm] === undefined) {
        return res.status(400).json({ success: false, message: "Invalid commodity" });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    shopStock[shopId][comm] += qty;

    res.json({
        success: true,
        message: "Stock refilled successfully",
        newStock: shopStock[shopId]
    });
});


app.post('/distribute', async (req, res) => {
    try {
        const { beneficiaryId, shopId, quantity, commodity, region, regionRisk, shopFrequency, monthlyTotal, timeGap } = req.body;

        // NEW: Validations
        const comm = (commodity || 'rice').toLowerCase(); // Default to rice for backward compat if needed, but frontend adds selector
        const qty = Number(quantity);

        // 1. Check Stock
        if (!shopStock[shopId] || shopStock[shopId][comm] < qty) { // Fix: < qty (check if we have enough)
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${shopStock[shopId]?.[comm] || 0} kg`
            });
        }

        // 2. Check Quota
        const usage = getBenUsage(beneficiaryId);
        const limit = MONTHLY_QUOTA[comm] || 0;
        const currentUsage = usage[comm] || 0;

        if (currentUsage + qty > limit) {
            return res.status(400).json({
                success: false,
                message: `Quota exceeded. Remaining: ${limit - currentUsage} kg`
            });
        }

        // 3. Check Fraud with AI
        // Soft influence: if requesting > 80% remaining quota or low stock ratio
        let softFraudBoost = 0;

        // Rule 1: Scarcity hoarding (if stock low < 20% of initial capacity?) 
        // We don't have max capacity, so let's assume if absolute stock is low e.g. < 50kg
        if (shopStock[shopId][comm] < 50) {
            softFraudBoost += 0.05;
        }

        // Rule 2: Maxing out quota at once?
        if (qty > (limit - currentUsage) * 0.8) {
            softFraudBoost += 0.05;
        }

        const aiResponse = await aiService.predictFraud({
            beneficiaryId, // Pass ID
            shopId, // Pass Shop ID (Critical Fix for 422 Error)
            quantity: qty,
            timeGap,
            monthlyTotal,
            shopFrequency,
            regionRisk
        });

        let fraudScore = aiResponse.fraud_score + softFraudBoost; // 0-1
        // Cap at 1.0
        if (fraudScore > 1.0) fraudScore = 1.0;

        // Re-evaluate risk level based on boosted score?
        let riskLevel = aiResponse.risk_level;
        if (fraudScore > 0.7 && riskLevel !== 'HIGH') riskLevel = 'HIGH'; // Simple override

        const reasons = aiResponse.reasons || [];
        if (softFraudBoost > 0) reasons.push("Scarcity/Hoarding Behavior Detected");

        const timestamp = Date.now();

        let txHash = null;
        let ipfsHash = null;

        // 4. Construct Encrypted/Hashed Paylod
        // For hackathon, we store JSON structure. In real world, sensitive data like beneficiaryId should be hashed or encrypted.
        const pdsPayload = {
            type: "PDS_DISTRIBUTION",
            data: {
                beneficiaryId, // In prod: hash(beneficiaryId)
                shopId,
                quantity: qty,
                region,
                timestamp
            },
            aiAnalysis: {
                fraudScore,
                riskLevel,
                status: riskLevel === 'HIGH' ? 'FLAGGED' : 'VERIFIED'
            }
        };

        // 5. Upload to IPFS
        try {
            ipfsHash = await ipfsService.uploadJSON(pdsPayload);
        } catch (ipfsError) {
            console.error("IPFS Upload Error:", ipfsError);
            // If IPFS fails, we might still want to proceed or block. Blocking for data integrity.
            throw new Error("Failed to store data on IPFS");
        }

        // 6. Record on Blockchain (EventChain)
        // If Risk is High, we might still record it as a "Rejected/Flagged" event
        try {
            const txResult = await blockchainService.addEvent("PDS_DISTRIBUTION", ipfsHash);
            txHash = txResult.txHash;
        } catch (bcError) {
            console.error("Blockchain write failed:", bcError.message);
            // Non-blocking for local demo if chain fails? Or blocking?
            // Blocking to ensure ledger property.
            throw new Error("Blockchain transaction failed");
        }

        // 7. Update Stock & Usage (Commit transaction)
        shopStock[shopId][comm] -= qty;
        beneficiaryUsage[beneficiaryId][comm] += qty;

        // 8. Save to Local DB (for cache/backup)
        await dbService.saveTransaction({
            beneficiaryId,
            shopId,
            quantity: qty,
            fraudScore,
            riskLevel,
            txHash,
            synced: true
        });

        res.json({
            success: true,
            fraudScore,
            riskLevel,
            reasons, // Return to frontend
            txHash,
            ipfsHash,
            remainingQuota: {
                [comm]: limit - (currentUsage + qty)
            },
            newStock: shopStock[shopId],
            message: riskLevel === 'HIGH' ? "Transaction Flagged as Fraud" : "Distribution Successful"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/transactions', async (req, res) => {
    try {
        const txs = await dbService.getAllTransactions();
        res.json(txs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/pds-events', async (req, res) => {
    try {
        const events = await blockchainService.getEvents();
        // Filter for PDS_DISTRIBUTION
        const pdsEvents = events.filter(e => e.eventType === 'PDS_DISTRIBUTION');
        res.json(pdsEvents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/events/verify/:hash', async (req, res) => {
    try {
        const hash = req.params.hash;
        const events = await blockchainService.getEvents();
        const event = events.find(e => e.ipfsHash === hash);

        if (!event) {
            return res.status(404).json({ exists: false, message: "Event hash not found on blockchain." });
        }

        // Fetch IPFS content
        let ipfsData = null;
        try {
            ipfsData = await ipfsService.getJSON(hash);
        } catch (e) {
            console.error("IPFS Fetch Error:", e);
        }

        res.json({
            exists: true,
            event: event,
            content: ipfsData,
            message: "Event Verified Successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/dashboard-metrics', async (req, res) => {
    // Return aggregated metrics
    try {
        // Source of truth: Blockchain events or Local DB?
        // Using Local DB for speed in dashboard
        const txs = await dbService.getAllTransactions();
        const total = txs.length;
        const fraud = txs.filter(t => t.fraud_score > 0.7).length;
        const pending = txs.filter(t => !t.synced).length;

        // Also fetch chain stats if needed
        // const chainEvents = await blockchainService.getEvents();

        res.json({
            totalTransactions: total,
            fraudAlerts: fraud,
            pendingSync: pending,
            systemHealth: "Good"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
