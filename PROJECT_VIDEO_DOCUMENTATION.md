# EventChain - AI-Enabled PDS Monitoring Platform
## Video Documentation Guide

---

## 📋 PROJECT ABSTRACT

**EventChain** is an intelligent, blockchain-powered platform that revolutionizes the **Public Distribution System (PDS)** monitoring through three core pillars:

### Vision
To create a transparent, tamper-proof, and AI-powered monitoring system for public distribution that prevents fraud, ensures accountability, and empowers citizens with verification capabilities.

### Key Innovation
EventChain combines **Blockchain immutability**, **IPFS decentralized storage**, and **AI-powered fraud detection** to create a unified platform where every ration distribution is treated as a verifiable "event" on a public ledger.

### Problem Statement
- **Traditional PDS systems** lack transparency and are prone to fraudulent activities
- No real-time verification mechanism for beneficiaries
- Difficult to audit and track distribution history
- Manual fraud detection is time-consuming and error-prone

### Solution
EventChain provides:
1. **Immutable Record Keeping** - Every transaction stored permanently on blockchain
2. **AI-Powered Fraud Detection** - Real-time analysis of distribution patterns
3. **Public Verification** - QR-code based instant verification for citizens
4. **Authority Dashboard** - Centralized monitoring with fraud alerts
5. **Decentralized Storage** - Complete transaction data on IPFS

### Impact
- ✅ **Transparency**: All transactions publicly verifiable
- ✅ **Fraud Prevention**: AI flags suspicious patterns before finalization
- ✅ **Citizen Empowerment**: Anyone can verify distributions via QR codes
- ✅ **Accountability**: Immutable audit trail for all stakeholders
- ✅ **Efficiency**: Automated monitoring reduces manual oversight

---

## 🏗️ PROJECT ARCHITECTURE

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER (React)                   │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │ PDS Dashboard│  │ Event Timeline│  │  Verification│    │
│   │  & Forms     │  │  & History   │  │  (QR Scan)   │    │
│   └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND ORCHESTRATION LAYER                    │
│  ┌───────────────────────┐  ┌──────────────────────────┐   │
│  │  Node.js Backend      │  │  Java Spring Boot API    │   │
│  │  - IPFS Integration   │  │  - Blockchain Service    │   │
│  │  - SQLite Cache       │  │  - QR Code Generation    │   │
│  │  - API Gateway        │  │  - Proof Validation      │   │
│  └───────────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│ Python AI    │   │  Blockchain  │   │   IPFS Network   │
│   Service    │   │  (Ethereum)  │   │  (Decentralized  │
│              │   │              │   │    Storage)      │
│ - Fraud ML   │   │ - Smart      │   │                  │
│ - Isolation  │   │   Contracts  │   │ - Metadata       │
│   Forest     │   │ - EventChain │   │ - Documents      │
└──────────────┘   └──────────────┘   └──────────────────┘
```

### Data Flow Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT CREATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. User Input (PDS Authority)
   ↓
2. Frontend Form Validation
   ↓
3. Node.js Backend receives request
   ↓
4. Python AI Service analyzes for fraud
   ├─→ High Risk? → Flag + Alert
   └─→ Low Risk → Continue
   ↓
5. Data packaged into JSON payload
   ↓
6. Uploaded to IPFS → Returns Hash (QmXXX...)
   ↓
7. Java Backend triggers Blockchain transaction
   ↓
8. Smart Contract stores: (actor, eventType, ipfsHash, timestamp)
   ↓
9. Transaction confirmed → Returns TX Hash
   ↓
10. Generate QR Code + Proof Certificate
    ↓
11. Store in SQLite cache for quick access
    ↓
12. Return success to Frontend with:
    - Transaction Hash
    - IPFS Hash
    - QR Code
    - Fraud Score
    - Verification Link
```

---

## 💻 TECHNOLOGY STACK

### **1. Frontend Layer**

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI Framework - Component-based architecture |
| **React Router DOM** | 6.20.0 | Client-side routing and navigation |
| **TailwindCSS** | 3.3.6 | Utility-first CSS framework for styling |
| **Axios** | 1.6.2 | HTTP client for API communication |
| **ethers.js** | 6.9.0 | Ethereum wallet integration (MetaMask) |
| **html5-qrcode** | 2.3.8 | QR code scanning functionality |
| **qrcode** | 1.5.4 | QR code generation |
| **Recharts** | 3.6.0 | Data visualization and charts |
| **Lucide React** | 0.294.0 | Icon library |
| **jsPDF** | 4.0.0 | PDF report generation |
| **i18next** | 25.8.0 | Internationalization support |

**Build Tools:**
- `react-scripts` 5.0.1
- `postcss` 8.4.32
- `autoprefixer` 10.4.16

---

### **2. Backend Layer - Node.js**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | JavaScript runtime for backend |
| **Express** | 4.18.2 | Web framework for REST API |
| **ethers.js** | 6.9.0 | Blockchain interaction library |
| **SQLite3** | 5.1.6 | Local database for caching events |
| **Axios** | 1.6.2 | HTTP client for AI service calls |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 16.3.1 | Environment variable management |
| **body-parser** | 1.20.2 | Request body parsing middleware |

**Dev Tools:**
- `nodemon` 3.0.2 - Auto-restart on file changes

---

### **3. Backend Layer - Java Spring Boot**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 17 | Programming language |
| **Spring Boot** | 3.2.0 | Enterprise application framework |
| **Spring Web** | - | REST API development |
| **Spring Validation** | - | Request validation |
| **Web3j** | 4.9.8 | Ethereum blockchain integration |
| **IPFS HTTP Client** | v1.4.4 | IPFS interaction (JitPack) |
| **ZXing (Core)** | 3.5.2 | QR code generation |
| **ZXing (JavaSE)** | 3.5.2 | QR code image output |
| **Jackson** | 2.15.2 | JSON processing |
| **Lombok** | 1.18.30 | Reduce boilerplate code |
| **Maven** | 3.6+ | Build and dependency management |

---

### **4. AI/ML Service - Python**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.8+ | Programming language |
| **FastAPI** | latest | Modern async web framework |
| **Uvicorn** | latest | ASGI server for FastAPI |
| **Pandas** | latest | Data manipulation and analysis |
| **NumPy** | latest | Numerical computing |
| **Scikit-learn** | latest | Machine learning library |
| **Joblib** | latest | Model serialization |
| **Requests** | latest | HTTP library |

**ML Algorithm:** Isolation Forest (Anomaly Detection)

---

### **5. Blockchain Layer**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.19 | Smart contract language |
| **Hardhat** | 2.28.0 | Ethereum development environment |
| **Hardhat Toolbox** | 4.0.0 | Essential Hardhat plugins |
| **Ganache** | - | Local Ethereum blockchain (testing) |
| **Ethereum** | - | Public blockchain network |

**Smart Contracts:**
- `EventChain.sol` - Universal verifiable event ledger
- `RationDistribution.sol` - PDS-specific logic

---

### **6. Storage & Infrastructure**

| Technology | Purpose |
|------------|---------|
| **IPFS** | Decentralized file storage for event metadata |
| **SQLite** | Local caching database |
| **Docker** | Containerization for deployment |
| **Git/GitHub** | Version control |

---

## 🔤 LANGUAGES USED

### Language Distribution by Purpose

| Language | Usage % | Purpose |
|----------|---------|---------|
| **JavaScript (JSX)** | 35% | Frontend UI components and logic |
| **Java** | 30% | Backend API and blockchain service |
| **Solidity** | 15% | Smart contracts on blockchain |
| **JavaScript (Node.js)** | 10% | Backend orchestration and IPFS |
| **Python** | 8% | AI/ML fraud detection service |
| **CSS** | 2% | Custom styling (mostly TailwindCSS) |

### Detailed Usage

#### **1. JavaScript/JSX (Frontend)**
- **Location**: `frontend/src/`
- **Purpose**: 
  - React components
  - User interface logic
  - Form handling
  - State management
  - API integration
  - Routing
- **Key Files**:
  - `App.js` - Main application router
  - `pages/` - Page components
  - `components/` - Reusable UI components
  - `services/api.js` - API client

#### **2. Java (Spring Boot Backend)**
- **Location**: `src/main/java/com/eventchain/`
- **Purpose**:
  - REST API endpoints
  - Blockchain integration via Web3j
  - IPFS service layer
  - QR code generation
  - Proof validation
  - Business logic
- **Key Packages**:
  - `controller/` - HTTP request handlers
  - `service/` - Business logic
  - `dto/` - Data transfer objects
  - `config/` - Configuration classes

#### **3. Solidity (Smart Contracts)**
- **Location**: `contracts/`
- **Purpose**:
  - On-chain event storage
  - Hash verification
  - Immutable ledger functions
- **Key Contracts**:
  - `EventChain.sol` - Universal event ledger
  - `RationDistribution.sol` - PDS-specific contract

#### **4. JavaScript (Node.js Backend)**
- **Location**: `backend-node/`
- **Purpose**:
  - IPFS integration
  - SQLite caching
  - Request routing
  - Blockchain interaction
- **Key Files**:
  - `index.js` - Main server
  - `routes/` - API routes
  - `services/` - Business logic

#### **5. Python (AI Service)**
- **Location**: `ai-service/`
- **Purpose**:
  - Fraud detection ML model
  - Pattern analysis
  - Risk scoring
  - FastAPI endpoints
- **Key Files**:
  - `main.py` - FastAPI application
  - `model.py` - ML model logic

---

## 🔗 INTEGRATION ARCHITECTURE

### **Integration 1: Frontend ↔ Node.js Backend**

**Technology**: JavaScript (React) → JavaScript (Express)

**Protocol**: HTTP/REST (Port 4000)

**Purpose**: 
- Form submissions
- Event retrieval
- Dashboard data
- IPFS metadata access

**Data Flow**:
```javascript
// Frontend (React)
axios.post('http://localhost:4000/api/events', eventData)

// Backend (Node.js)
app.post('/api/events', async (req, res) => {
  // Process and route to blockchain/AI
})
```

**Communication Format**: JSON

---

### **Integration 2: Frontend ↔ Java Spring Boot API**

**Technology**: JavaScript (React) → Java (Spring Boot)

**Protocol**: HTTP/REST (Port 8081)

**Purpose**:
- Blockchain transactions
- Event verification
- QR code generation
- Proof retrieval

**Data Flow**:
```javascript
// Frontend
const response = await api.post('/events', {
  eventType: 'ration',
  metadata: JSON.stringify(data)
})

// Java Backend
@PostMapping("/events")
public ResponseEntity<?> createEvent(@RequestBody EventRequest req)
```

**Communication Format**: JSON

---

### **Integration 3: Node.js Backend ↔ Python AI Service**

**Technology**: JavaScript (Node.js) → Python (FastAPI)

**Protocol**: HTTP/REST (Port 5000)

**Purpose**:
- Fraud score prediction
- Transaction analysis
- Pattern detection

**Data Flow**:
```javascript
// Node.js sends to AI
const aiResponse = await axios.post('http://localhost:5000/predict-fraud', {
  beneficiary_id, shop_id, quantity, 
  time_gap_hours, region_risk
})

// Python receives and processes
@app.post("/predict-fraud")
def predict_fraud(transaction: TransactionRequest):
    score, risk, reasons = detector.predict(data)
    return {"fraud_score": score, "risk_level": risk}
```

**Communication Format**: JSON

**Response**:
- `fraud_score` (0.0 - 1.0)
- `risk_level` ("LOW", "MEDIUM", "HIGH")
- `reasons` (Array of strings)

---

### **Integration 4: Java Backend ↔ Ethereum Blockchain**

**Technology**: Java (Web3j) → Solidity (Smart Contracts)

**Protocol**: Ethereum JSON-RPC

**Purpose**:
- Store events on-chain
- Verify hashes
- Query event history

**Data Flow**:
```java
// Java calls smart contract
TransactionReceipt receipt = contract.addEvent(
    eventType, 
    ipfsHash
).send();

// Solidity executes
function addEvent(string memory eventType, string memory metadataHash) public {
    events.push(Event({
        actor: msg.sender,
        eventType: eventType,
        metadataHash: metadataHash,
        timestamp: block.timestamp
    }));
}
```

**Communication Format**: ABI-encoded function calls

---

### **Integration 5: Node.js Backend ↔ IPFS Network**

**Technology**: JavaScript (Node.js) → IPFS Protocol

**Protocol**: IPFS HTTP API (Port 5001)

**Purpose**:
- Upload event metadata
- Retrieve stored data
- Decentralized storage

**Data Flow**:
```javascript
// Upload to IPFS
const result = await ipfs.add(JSON.stringify(eventData))
const ipfsHash = result.path // "QmXXX..."

// Retrieve from IPFS
const data = await ipfs.cat(ipfsHash)
```

**Communication Format**: Multipart form data / Binary

**Returns**: IPFS Content Identifier (CID)

---

### **Integration 6: Java Backend ↔ IPFS Network**

**Technology**: Java (IPFS HTTP Client) → IPFS Protocol

**Protocol**: IPFS HTTP API

**Purpose**:
- Dual upload verification
- Java-based IPFS operations

**Data Flow**:
```java
IPFS ipfs = new IPFS("/ip4/127.0.0.1/tcp/5001");
byte[] content = metadata.getBytes();
MerkleNode result = ipfs.add(new NamedStreamable.ByteArrayWrapper(content));
String hash = result.hash.toString();
```

---

### **Integration 7: Frontend ↔ MetaMask (Web3 Wallet)**

**Technology**: JavaScript (ethers.js) → Browser Extension (MetaMask)

**Protocol**: Ethereum Provider API

**Purpose**:
- Wallet connection
- Transaction signing
- Account management

**Data Flow**:
```javascript
// Connect wallet
const provider = new ethers.BrowserProvider(window.ethereum)
await provider.send("eth_requestAccounts", [])

// Get signer
const signer = await provider.getSigner()
const address = await signer.getAddress()
```

**Communication Format**: JSON-RPC via browser injection

---

### **Integration 8: All Layers ↔ SQLite Database**

**Technology**: Node.js (sqlite3) / Java (JDBC)

**Protocol**: SQL

**Purpose**:
- Cache blockchain events
- Quick data retrieval
- Offline functionality

**Data Flow**:
```javascript
// Node.js SQLite
db.run(`INSERT INTO events (ipfsHash, txHash, timestamp) 
        VALUES (?, ?, ?)`, [ipfsHash, txHash, Date.now()])

// Query
db.all(`SELECT * FROM events ORDER BY timestamp DESC`)
```

---

## 📁 PROJECT STRUCTURE

```
EventChain-PDS/
│
├── frontend/                      # React Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── WalletConnector.jsx
│   │   │   ├── EventForm.jsx
│   │   │   ├── EventTimeline.jsx
│   │   │   └── VerifyEventComponent.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── AddEventPage.jsx
│   │   │   ├── TimelinePage.jsx
│   │   │   ├── VerifyPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── services/             # API clients
│   │   │   └── api.js
│   │   ├── context/              # React context
│   │   ├── constants/            # Configuration
│   │   ├── locales/              # i18n translations
│   │   ├── App.js                # Main app component
│   │   ├── index.js              # Entry point
│   │   └── index.css             # Global styles
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
├── backend-node/                  # Node.js Backend
│   ├── index.js                  # Express server
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic
│   ├── db/                       # SQLite database
│   ├── package.json
│   └── .env
│
├── src/                          # Java Spring Boot Backend
│   └── main/
│       ├── java/com/eventchain/
│       │   ├── EventChainApplication.java
│       │   ├── controller/       # REST controllers
│       │   │   └── EventController.java
│       │   ├── service/          # Business logic
│       │   │   ├── BlockchainService.java
│       │   │   ├── IpfsService.java
│       │   │   ├── QRCodeService.java
│       │   │   └── ProofService.java
│       │   ├── dto/              # Data transfer objects
│       │   ├── model/            # Domain models
│       │   └── config/           # Spring configuration
│       └── resources/
│           └── application.properties
│
├── ai-service/                    # Python AI Service
│   ├── main.py                   # FastAPI application
│   ├── model.py                  # ML model logic
│   ├── fraud_model.pkl           # Trained model file
│   └── requirements.txt
│
├── contracts/                     # Solidity Smart Contracts
│   ├── EventChain.sol            # Universal event ledger
│   └── RationDistribution.sol    # PDS-specific contract
│
├── scripts/                       # Deployment scripts
│   ├── deploy-with-hardhat.js
│   └── setup-ganache.bat
│
├── pom.xml                        # Java dependencies
├── package.json                   # Hardhat config
├── hardhat.config.js             # Hardhat network config
├── docker-compose.yml            # Docker orchestration
└── README.md                      # Project documentation
```

---

## 🎯 KEY FEATURES BREAKDOWN

### 1. **Unified Event Ledger**
- **Language**: Solidity, Java
- **Integration**: Java ↔ Ethereum via Web3j
- **Purpose**: Immutable storage of all PDS transactions

### 2. **AI Fraud Detection**
- **Language**: Python
- **Integration**: Node.js ↔ Python via HTTP
- **Algorithm**: Isolation Forest
- **Features**:
  - Real-time scoring
  - Pattern recognition
  - Explainable AI (reason generation)

### 3. **Decentralized Storage**
- **Language**: Java, JavaScript
- **Integration**: Backend ↔ IPFS via HTTP API
- **Purpose**: Store complete transaction metadata

### 4. **QR Code Verification**
- **Language**: Java (generation), JavaScript (scanning)
- **Integration**: Java (ZXing) + React (html5-qrcode)
- **Purpose**: Citizen-facing verification

### 5. **Authority Dashboard**
- **Language**: JavaScript (React)
- **Integration**: React ↔ Multiple backends
- **Features**:
  - Live event feed
  - Fraud alerts
  - System health monitoring
  - Data visualization (Recharts)

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Development Environment
```
Local Machine
├── Frontend (React Dev Server - :3000)
├── Node.js Backend (:4000)
├── Java Backend (:8081)
├── Python AI Service (:5000)
├── Ganache (Local Blockchain - :7545)
└── IPFS Daemon (:5001)
```

### Production Environment (Proposed)
```
Cloud Infrastructure
├── Frontend: Vercel/Netlify
├── Node.js Backend: Render/Heroku
├── Java Backend: AWS EC2 / Azure
├── Python AI: AWS Lambda / Google Cloud Run
├── Blockchain: Ethereum Mainnet / Polygon
└── IPFS: Pinata / Infura IPFS Gateway
```

---

## 📊 SYSTEM CAPABILITIES

| Capability | Technology Stack |
|-----------|-----------------|
| **Real-time Fraud Detection** | Python (FastAPI) + Scikit-learn |
| **Immutable Storage** | Solidity + Ethereum + IPFS |
| **Public Verification** | React + Java (ZXing) + QR Codes |
| **Authority Monitoring** | React + Node.js + SQLite |
| **Wallet Integration** | ethers.js + MetaMask |
| **Decentralized Data** | IPFS Network |
| **Caching Layer** | SQLite Database |
| **PDF Reports** | jsPDF (JavaScript) |
| **Internationalization** | i18next (Multi-language) |
| **Data Visualization** | Recharts (React) |

---

## 🎬 VIDEO CONTENT SUGGESTIONS

### Segment 1: Introduction (2 min)
- Project name and tagline
- Problem statement
- Solution overview
- Impact metrics

### Segment 2: Architecture Deep Dive (4 min)
- Show architecture diagram
- Explain data flow
- Highlight each layer
- Technology stack overview

### Segment 3: Technology Breakdown (3 min)
- Frontend stack
- Backend layers (Node.js + Java)
- AI service
- Blockchain layer
- Storage solutions

### Segment 4: Integration Showcase (3 min)
- Language distribution
- How components communicate
- API integrations
- Real-time data flow

### Segment 5: Demo Walkthrough (3 min)
- Live demo of event creation
- Show QR verification
- Display fraud detection
- Authority dashboard

### Segment 6: Use Cases & Impact (2 min)
- Real-world applications
- Benefits to stakeholders
- Future enhancements

---

## 📈 PROJECT METRICS

- **Total Languages**: 5 (JavaScript, Java, Solidity, Python, CSS)
- **Total Integrations**: 8 major integration points
- **Microservices**: 3 (Node.js, Java, Python)
- **Smart Contracts**: 2
- **Frontend Pages**: 5+
- **API Endpoints**: 15+
- **Dependencies**: 50+ packages across all services

---

## 🔐 SECURITY FEATURES

| Feature | Implementation |
|---------|---------------|
| **Private Key Security** | Environment variables, never hardcoded |
| **CORS Protection** | Express CORS middleware |
| **Input Validation** | Spring Validation + FastAPI Pydantic |
| **Hash Verification** | Keccak256 cryptographic hashing |
| **Immutability** | Blockchain prevents data tampering |
| **Decentralization** | IPFS eliminates single point of failure |

---

## ✨ UNIQUE SELLING POINTS

1. **Multi-Stack Integration**: Seamlessly combines 5 different technologies
2. **AI-Powered**: Real-time fraud detection using machine learning
3. **Decentralized**: No single point of control or failure
4. **Citizen-Centric**: QR-based verification empowers end users
5. **Production-Ready**: Complete with Docker, deployment scripts, comprehensive documentation

---

*This documentation is optimized for creating engaging video content that clearly explains the EventChain platform's architecture, technology stack, and innovative integration approach.*
