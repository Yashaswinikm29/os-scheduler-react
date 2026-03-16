# Intelligent OS Scheduling Simulator
### DevOps Mini Project — BNM Institute of Technology
**Course:** DevOps (23CSE1663) | **Team:** 1BG24CS159 (Srusti M), 1BG24CS191 (Yashaswini K M)

---

## Project Structure

```
os-scheduling-simulator/
├── src/
│   ├── main/
│   │   ├── java/com/osscheduler/
│   │   │   ├── Process.java           ← Process data model
│   │   │   ├── Scheduler.java         ← All 4 algorithms (FCFS, SJF, Priority, RR)
│   │   │   ├── ScheduleResult.java    ← Result model
│   │   │   └── SchedulerServlet.java  ← REST API endpoint
│   │   └── webapp/
│   │       ├── index.html             ← Frontend simulator UI
│   │       └── WEB-INF/web.xml
│   └── test/
│       └── java/com/osscheduler/
│           └── SchedulerTest.java     ← 10 JUnit 5 tests
├── pom.xml                            ← Maven build config
├── Jenkinsfile                        ← 8-stage CI/CD pipeline
└── README.md
```

---

## Prerequisites

| Tool     | Version  | Download |
|----------|----------|---------|
| Java JDK | 11+      | https://adoptium.net |
| Maven    | 3.8+     | https://maven.apache.org |
| Jenkins  | LTS      | https://jenkins.io |
| Git      | Any      | https://git-scm.com |

---

## Step-by-Step Setup

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: OS Scheduling Simulator"
git remote add origin https://github.com/YOUR_USERNAME/os-scheduling-simulator.git
git push -u origin main
```

### 2. Build & Test Locally
```bash
# Compile
mvn clean compile

# Run tests
mvn test

# Package WAR
mvn package
# Output: target/os-scheduler.war
```

### 3. Install Jenkins (Windows)
1. Download Jenkins LTS installer from https://jenkins.io/download
2. Run installer → Jenkins starts at http://localhost:8080
3. Install suggested plugins during setup
4. Install extra plugins: **Git**, **Pipeline**, **JUnit**

### 4. Create Jenkins Pipeline Job
1. New Item → **Pipeline** → name it `os-scheduler`
2. Under **Pipeline** section:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: your GitHub repo URL
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
3. Click **Save** then **Build Now**

### 5. Create Deployment Folders
Create these folders on your machine (Jenkins will auto-create them too):
```
C:\deployment\DEV\webapps\
C:\deployment\TEST\webapps\
C:\deployment\PROD\webapps\
```

### 6. View the Simulator
Open `src/main/webapp/index.html` directly in your browser —
the simulator runs fully client-side with no server needed for the demo.

---

## Jenkins Pipeline Stages

| Stage | What it does |
|-------|-------------|
| 1. Checkout    | Pulls code from GitHub |
| 2. Build       | `mvn clean compile` |
| 3. Test        | `mvn test` + publishes JUnit report |
| 4. Package     | `mvn package` → creates WAR file |
| 5. Validate    | Checks WAR file exists |
| 6. Deploy DEV  | Copies WAR to DEV folder |
| 7. Deploy TEST | Copies WAR to TEST folder |
| 8. Deploy PROD | Manual approval → copies WAR to PROD |

---

## Algorithms Implemented

| Algorithm | Type | Key Property |
|-----------|------|-------------|
| FCFS | Non-preemptive | First arrived, first served |
| SJF  | Non-preemptive | Shortest burst time runs first |
| Priority | Non-preemptive | Lower priority number = runs first |
| Round Robin | Preemptive | Each process gets equal time quantum |

---

## Technologies Used

| Category | Technology |
|----------|-----------|
| Version Control | Git, GitHub |
| Backend | Java 11 |
| Build Tool | Maven 3.8 |
| Testing | JUnit 5 |
| CI/CD | Jenkins |
| Frontend | HTML, CSS, JavaScript |
| Deployment | DEV / TEST / PROD (local folders) |
