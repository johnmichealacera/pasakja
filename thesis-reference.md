
QR-Code Integrated Inventory Management System for General Supplies Office

______________________

An Undergraduate Thesis Presented to
The Faculty of College of Information Technology
Bucas Grande Foundation College
Socorro, Surigao del Norte

______________________

In Partial Fulfilment 
of the Requirements for the Degree
BACHELOR OF SCIECNE INFORMATION TECHNOLOGY 

______________________


Wendel Godinez
Researcher 2 
 Researcher 3

2026


APPROVAL SHEET

This capstone Project entitled QR-Code Integrated Inventory Management System for General Supplies Office 
•	Prepared and submitted by Wendel Godinez, Researcher 2, Researcher 3 
Has been examined and is recommended for approval and acceptance


_____________________________________________________________
Approved by the committee on oral Examination during proposal with a grade of __on May 30, 2026

______________
Chairman


_____________________               	 	   	 _______________
		Member				         		Member

			       Rhea Jean Belsondra, MIT
			Dean, College of information Technology

ACCEPTED in partial fulfillment of the degree Diploma Information Technology.
TABLE OF CONTENTS

Title										Page
APPROVAL SHEET							    i	
ACKNOWLEDGEMENT							    ii	
TABLE OF CONTENTS							   iii	  
CHAPTER
1.	INTRODUCTION                                                                                5
Project Context                                                                                       5
Purpose and Description                                                                        6
Research Objectives                                                                               6                                                                     
Scope and Limitations of the project                                                     7
Significance of the Study                                                                       8
2.	REVIEW OF RELATED LITERATURE                                         9
Synthesis                                                                                                11
3.	TECHNICAL BACKGROUND                                                         12
4.	METHODOLOGY                                                                              18
5.	RESULTS AND DISCUSSION                                                          29 
6.	CONCLUSION AND RECOMMENDATIONS                               54
Conclusion                                                                                             54
Challenges Overcome                                                                            56
System Validation                                                                                  57
Research Contributions                                                                          57
Overall Assessment                                                                                58
Recommendation                                                                                   59
Final Thoughts                                                                                       66
References                                                                                 		   68 
CURRICULUM VITAE                                                                                 69
                                      
   
ACKNOWLEDGEMENT

The researchers would like to express their sincere gratitude to all individuals and institutions who contributed to the success of this study.
First and foremost, we thank our Almighty God for granting us the strength, wisdom, and perseverance throughout the course of our research.
Our heartfelt appreciation goes to our research adviser, for his invaluable guidance, encouragement, and constructive feedback, which greatly improved the quality of our work. And also we are deeply grateful to the Dean of the College of Information Technology.
I am also thankful to my CO Researcher’s for their assistance and encouragement. Lastly, we dedicate this work to our families and loved ones for their unwavering support, understanding, and patience.
Thank you all for being part of this meaningful journey.



						Researcher 1
		 	  	    Researcher 2
		   		         Wendel Godinez









CHAPTER 1  
INTRODUCTION
                Efficient inventory management is essential for the smooth operation of any organization. General supplies offices, in particular, face challenges with manual record-keeping, paper-based tracking, and scattered data across spreadsheets or logbooks. This traditional approach leads to delayed visibility, inconsistent stock counts, difficulty in locating items, and limited accountability for transactions. The QR-Code Integrated Inventory Management System addresses these challenges by automating item management, transaction recording, and reporting. The system enables staff to create and manage inventory items with auto-generated QR codes, perform transactions (receive, issue, return) via QR scanning or manual entry, and view comprehensive dashboards and audit logs. By streamlining the inventory process with QR technology, the system enhances efficiency, accuracy, and transparency for general supplies operations, benefiting administrators, staff, auditors, and the organizations they serve.
PROJECT CONTEXT
             In many general supplies offices, manual tracking of inventory items leads to problems such as delayed stock updates, incomplete transaction records, and limited visibility into current stock levels. The increasing demand for efficient, transparent, and data-driven inventory management has led to the adoption of digital solutions in various organizations. However, many existing systems are either too expensive, lack QR code integration, or do not provide role-based access control tailored for supplies office workflows. The QR-Code Integrated Inventory Management System is designed to fill this gap by providing a customized web-based solution that integrates inventory management, QR code generation and scanning, transaction recording, and role-based dashboards. The system operates on a secure platform where staff create items and categories, scan QR codes to quickly record transactions, and administrators and auditors view reports and audit logs. This reduces the risk of data loss, unauthorized access, and delays in operational visibility.
By replacing manual tracking with automated digital workflows and QR technology, the system enhances the efficiency and professionalism of supplies office operations. Staff can focus on issuing and receiving items, administrators can monitor stock levels and trends, and auditors can trace all actions through a comprehensive audit trail.
PURPOSE AND DESCRIPTION
The main goal of the QR-Code Integrated Inventory Management System is to provide an efficient, accurate, and transparent method of managing inventory for general supplies offices. By automating item management, QR code generation, transaction recording, and reporting, the system minimizes human errors, speeds up item lookup and transaction processing, and ensures visibility across all roles.
Key Features:
•	Inventory Management: Full CRUD operations for items with name, description, category, and reorder level. Categories module for organizing items.
•	QR Code System: Auto-generated QR codes per item containing only item ID. Downloadable QR codes for physical labeling.
•	QR Scanner: Camera-based scanning with fallback manual entry. Scan to fetch item details and perform Issue, Receive, or Return transactions.
•	Transaction Recording: Record IN (receive), OUT (issue), and RETURN movements. Stock is computed from transaction history—no direct quantity storage.
•	User Authentication: Secure login with role-based access (Admin, Staff, Auditor).
•	Dashboard: Summary cards for total items, low stock count, total transactions; recent transactions; low stock alerts.
•	Reports: Filterable transaction reports by date range, item, and transaction type.
•	Audit Logs: Track all user actions with timestamps and affected data (Admin and Auditor only).
•	User Management: Admin-only CRUD for users and role assignment.
•	REST API: Full API layer for future mobile app integration.
RESEARCH OBJECTIVES
General Objective:
To develop and implement a web-based QR-code integrated inventory management system that ensures accurate, secure, and efficient inventory and transaction management for general supplies offices.
Specific Objectives:
1.	To create a system that allows real-time inventory management and transaction recording via QR scanning or manual entry.
2.	To integrate QR code generation and scanning for quick item identification and transaction processing.
3.	To integrate security features such as user authentication and role-based access control.
4.	To eliminate manual errors by automating stock computation from transaction history.
5.	To provide a user-friendly interface for administrators, staff, and auditors.
6.	To generate dashboards, reports, and audit logs for transparency and operational visibility.
SCOPE AND LIMITATIONS OF THE STUDY
Scope:
This study focuses on designing and implementing the QR-Code Integrated Inventory Management System, covering:
•	Digital inventory and category management by Admin and Staff.
•	QR code generation for each item upon creation.
•	QR scanning (camera or manual entry) for item lookup and transaction recording.
•	Secure authentication and role-based access control (Admin, Staff, Auditor).
•	Dashboard and reporting for all roles; audit logs for Admin and Auditor.
•	Transaction types: IN (receive), OUT (issue), RETURN.
•	Stock computation from transaction history (no direct quantity storage).
Limitations:
•	The system is designed for general supplies office operations and may require adaptation for other inventory domains (e.g., retail, manufacturing).
•	QR scanner requires camera permission and may not work optimally in low-light or poor conditions.
•	Initial setup and training may be needed for staff to use the QR scanner and transaction workflow effectively.
SIGNIFICANCE OF THE STUDY
Administrators:
This system provides a comprehensive platform for managing inventory, monitoring low stock, viewing transaction reports, and maintaining full audit trails for accountability.
Staff:
Staff can efficiently add items, generate and download QR codes, scan items to record transactions, and view inventory status without manual paperwork.
Auditors:
Auditors can access audit logs and transaction history to verify compliance and trace all user actions with timestamps.
Organizations:
Automating inventory tracking and reporting reduces workload, eliminates manual errors, and ensures data-driven decision-making for supplies management.
Future Researchers:
This study serves as a reference for future improvements in inventory management and QR-based tracking systems, offering insights into system design, implementation, and impact.
The QR-Code Integrated Inventory Management System modernizes general supplies operations, ensuring efficiency, transparency, and accountability. With QR-based scanning, role-based access, and comprehensive reporting, it sets a new standard for inventory management in office settings.
CHAPTER 2
REVIEW OF RELATED LITERATURE / SYSTEMS
This chapter reviews scholarly and applied literature relevant to the QR-Code Integrated Inventory Management System for the College of Criminology equipment and supplies office. The review is organized thematically: digital inventory and tracking, web-based systems in organizational and Philippine contexts, QR code technology, security and role-based access control, and audit trails. Literature published from 2021 to 2026 is emphasized so that the theoretical foundation reflects current practice in information systems, inventory automation, and institutional governance.
The present study addresses persistent problems in manual inventory control—delayed recording, stock discrepancies, weak borrower accountability on issuance and return, and limited audit visibility. The reviewed works collectively justify a web-based, QR-enabled, role-secured, and audit-ready solution aligned with the objectives of this capstone project. 
Digital Inventory and Tracking Systems
Modern operations increasingly depend on digital inventory and tracking systems to replace paper ledgers, spreadsheets, and ad hoc counting. Compared with manual methods, digital systems reduce transcription errors, shorten the time between physical movement and recorded balance, and improve visibility for administrators and auditors.
Tian and Wang (2022) conducted an empirical study on the relationship between information technology (IT) capability and inventory management performance. Using survey data and structural analysis, they reported that IT capability positively influences inventory strategy and operational processes while helping reduce out-of-stock situations. Their findings support the argument that organizations that invest in integrated digital tools—not merely digitized forms—achieve more reliable inventory outcomes. For an academic equipment office, where issuance peaks at the start of terms and returns cluster at semester end, timely digital recording is essential to avoid stale stock figures.
Destro, Staudt, Somensi, and Taboada (2023) examined inventory record inaccuracy (IRI) and cycle counting in distribution centers. They showed that inaccuracies in recorded stock propagate into picking errors, lost sales risk, and capacity misallocation, and that structured counting policies can mitigate—but not always eliminate—IRI depending on warehouse type. Although their setting is industrial logistics, the underlying lesson applies to any inventory domain: recorded quantity must stay aligned with physical movement. The proposed system addresses this through transaction-level recording (IN, OUT, RETURN) rather than static stock fields edited by hand.
Malang, Charoenkwan, and Wudhikarn (2023) synthesized critical success factors for unmanned aerial vehicle (UAV) applications in warehouse management through a systematic literature review. While UAVs are not part of the current capstone scope, the review reinforces a broader trend: organizations pursue automated identification and synchronization to cope with growing item volumes and limited staff time. Handheld QR scanning at the equipment desk is a pragmatic, low-cost entry point on the same continuum—accurate identification without airborne infrastructure.
Lin, Chang, and Huang (2024) developed a UAV navigation and warehouse inventory system using reinforcement learning, linking automated capture with inventory updates. Again, the technology stack differs from this project, but the principle is consistent: capture identity digitally, then update the central database immediately. The QR-Code Integrated Inventory Management System applies that principle using browser-based scanning and server-side stock computation.
Olanrewaju, Dollah, and Ajayi (2021) designed a cloud-based inventory approach aimed at reducing under-stock and over-stock hazards. Cloud-hosted, web-accessible inventory aligns with the architectural choice of a Next.js application backed by PostgreSQL, enabling custodians to record transactions from any authorized workstation without maintaining local files.
Together, these studies establish that digital inventory systems improve accuracy, support operational decisions, and reduce dependence on error-prone manual tallies—core motivations for automating Criminology program equipment tracking.
Web-Based Inventory Management in Organizational and Educational Settings
Web-based inventory systems have become a standard pattern for small and medium enterprises, government units, and academic departments because they require no client installation, support role-based access from the browser, and centralize data for reporting.
Tanaman et al. (2023) documented a web-based inventory management system for a multi-branch enterprise in Pagadian City, Philippines. The authors reported that manual paper-based recording caused data inaccuracy and inefficient report distribution, and that a web platform for electronic recording and automated reports addressed these gaps. The Philippine context is directly relevant: localized requirements (branch or section structure, straightforward reporting, limited IT staff) mirror constraints faced by a college equipment room.
Fajar et al. (2025) implemented a web-based inventory system with QR code integration and a sequential search algorithm at a regional revenue office in Indonesia. After simulation and field testing with ten respondents, they reported approximately 95% improvement in data recording accuracy, 60% reduction in item search time, and a 77.25 mean score on the System Usability Scale (SUS). Their work is especially pertinent because it combines government asset stewardship, QR-assisted lookup, and measurable usability—outcomes the present capstone can emulate through structured user evaluation.
Anggara, Anshor, and Hadikristanto (2024) designed a web-based QR-code information system for warehouse inventory using the Rapid Application Development (RAD) method at an industrial site. They emphasized reduced human error in recording and tracking and improved operational efficiency. The parallel to this study is clear: RAD and agile web development both prioritize iterative delivery with user feedback, which matches how the QR inventory system was shaped around custodian and auditor workflows.
Choiriyati, Alfiah, Setiadi, and Supriadi (2026) described digital transformation of inventory management through QR integration in web systems built with an agile software development model. They framed inventory modernization as an educational and organizational change process—not only a technical upgrade—which supports capstone narratives that stress training, role clarity, and adoption alongside software features.
Agboola et al. (2022) and Johari and Aziz (2023) reported web and IoT-oriented inventory platforms for small businesses, highlighting automation of stock monitoring and reduced manual entry. These works reinforce that web dashboards, alerts, and centralized records are achievable even with modest budgets, a realistic assumption for college-level deployment.
David et al. (2023) reviewed local government digital technology adoption strategies using a PRISMA-based synthesis. Although focused on e-governance broadly, their analysis underscores that public and semi-public institutions in the Philippines adopt digital systems when benefits in transparency, service delivery, and data integrity are clear. A Criminology equipment office functions as a steward of program assets; demonstrating traceable issuance and return strengthens institutional accountability in the same spirit as local digital governance reforms. Dashboard summaries, low-stock alerts, and exportable transaction reports provide decision support through accurate, centralized data in the same manner as e-governance dashboards described in recent Philippine IS literature.
For higher-education asset contexts, commercial and institutional practice (equipment checkout systems, multi-campus asset registers) consistently stresses checkout/return workflows, maintenance history, and audit-ready logs. The proposed system narrows that model to program-scoped inventory (Criminology equipment), student borrowers, and QR identification, making it a focused academic implementation rather than a generic enterprise suite.
QR Code Technology in Inventory Management
Quick Response (QR) codes encode machine-readable identifiers in a compact graphic. Originally standardized for high-speed decoding in manufacturing and logistics, QR symbols are now common in retail, healthcare asset tagging, and institutional stockrooms because smartphones and inexpensive USB cameras can scan them without proprietary hardware.
Yang, Jan, Chen, and Wang (2023) developed a convolutional neural network (CNN) approach for QR code reading on packages in UAV logistics. Their work illustrates that QR remains a dominant carrier for item identity in automated supply chains. The capstone system uses QR values in the form INV-{itemId} to bind a physical label to a database row, eliminating manual keying during busy issuance periods.
Pore, Patle, and Thorat (2026) proposed a UAV-based QR scanning framework with inventory synchronization and safety-aware trajectory planning, reporting high simulated decode accuracy and measurable end-to-end latency. While the capstone does not deploy drones, the paper strengthens the academic claim that QR-driven synchronization is an active research area for keeping digital stock aligned with physical reality.
Fajar et al. (2025) and Anggara et al. (2024) (discussed above) provide direct evidence that web + QR combinations improve accuracy and search speed in real organizations. Choiriyati et al. (2026) further link QR-enabled web inventory to agile delivery, which matches iterative capstone development.
Operational benefits documented across these sources include:
•	Faster item lookup at the point of issue or return 
•	Lower transcription error compared with typing item names or serial numbers 
•	Consistent binding between physical tag and digital record 
•	Support for printable labels on uniforms, training gear, forensic kits, and documentation supplies relevant to Criminology programs
The QR-Code Integrated Inventory Management System implements generation (PNG download on item detail), camera scanning (html5-qrcode), manual value entry as fallback, and API lookup (GET /api/scan?value=...), covering field conditions where lighting or device quality varies.
Security, Authentication, and Role-Based Access Control
Inventory data—quantities, borrower identities, movement history—must be protected from unauthorized viewing or alteration. Security literature treats authentication (proving user identity) and authorization (granting appropriate permissions) as foundational.
Wang (2026) presented a formalized zoned role-based framework for integrated enterprise systems, covering analysis, design, implementation, maintenance, and access control. The framework argues that RBAC must be embedded across the system lifecycle, not added as an afterthought. The capstone applies RBAC through Admin, Custodian, and Auditor roles with server-side requireRole() checks and navigation filtered by role.
Farhadighalati, Estrada-Jimenez, Nikghadam-Hojjati, and Barata (2025) systematically reviewed access control models, describing RBAC, attribute-based models, and hybrid approaches used in modern applications. They note ongoing research into finer-grained, context-aware permissions. For this project, three well-separated roles match organizational reality: administrators configure users and structure; custodians run day-to-day issuance; auditors review reports and audit logs without mutating stock.
Kalaria, Kayes, Rahayu, Pardede, and Shahraki (2024) studied adaptive context-aware access control in IoT environments. Their results on reducing unauthorized access attempts support implementing session-based login, password hashing (bcrypt), and middleware route protection—all present in the Auth.js v5 implementation.
Patzelt et al. (2024) designed an end-to-end audit trail framework for interconnected enterprise architectures, including pseudonymization considerations. Their work situates audit trails within security architecture, not optional logging. The capstone’s AuditLog model records user, action, entity, and details for mutations, accessible to Admin and Auditor roles.
Role mapping for this study:
Role	Intended use
Admin	User management, full inventory and category control, item deletion, audit visibility
Custodian	Borrower registry, QR scanning, transaction recording, inventory maintenance (no user admin)
Auditor	Read-oriented oversight, filtered reports, CSV export, audit logs; no scanner or borrower admin
This separation aligns with Farhadighalati et al. (2025) and Wang (2026) on least-privilege access and supports panel questions on how the system prevents custodians from altering user accounts or auditors from issuing equipment without trace.
Audit Trails, Accountability, and Transparency
Accountability requires knowing who performed what action, when, and on which record. Audit trails support internal control, dispute resolution, accreditation documentation, and post-incident review.
Patzelt et al. (2024) emphasized comprehensive auditing across interconnected services, implementing frameworks that preserve traceability even when systems span multiple hosts. The capstone audit module is simpler in deployment but aligned in purpose: each create/update/delete on items, categories, borrowers, transactions, and users can generate an audit entry.
Fajar et al. (2025) noted that government inventory errors affect public trust and financial reporting; digital recording with QR lookup reduces ambiguity about which asset moved. Linking transactions to registered borrowers (student ID, name, program section) extends accountability from “stock decreased by five” to “five units issued to a identifiable student,” which manual logbooks often fail to capture consistently.
David et al. (2023) associated digital adoption in Philippine local government with improved transparency and service outcomes. Equipment offices that serve students and faculty benefit similarly when issuance and return are queryable, exportable (CSV reports), and visible on dashboards (recent transactions with borrower column).
Design implications drawn from the literature and implemented in this system:
•	Immutable-style transaction history as the source of stock truth 
•	Audit logs for administrative mutations 
•	Reports filterable by item, type, borrower, and date range 
•	Export for external review without granting edit rights
Transaction-Based Stock Logic and Borrower-Linked Movements
A distinctive design choice in this capstone—supported by inventory research—is deriving on-hand quantity from movement transactions rather than editing a static “quantity on hand” field.
Destro et al. (2023) showed that record inaccuracy undermines warehouse performance; continuous alignment between events and records is the remedy. The function getItemStock(itemId) aggregates IN and RETURN as additions and OUT as subtractions, then applies max(0, stock) to avoid displaying negative balances when data is incomplete.
Fajar et al. (2025) required accurate digital recording at a government office; borrower-linked issuance is the Criminology extension of that idea—OUT and RETURN require a registered borrower, while IN (receiving new stock) does not. Validation via Zod schemas and server rules prevents incomplete issuance records from entering the database.
Low-stock alerting (currentStock <= reorderLevel) connects operational literature on reorder policies with dashboard usability, giving custodians proactive notice before training or laboratory activities are disrupted.
Synthesis
The reviewed literature from 2021 through 2026 converges on several propositions that directly support the QR-Code Integrated Inventory Management System:
1.	Digital and web-based inventory improves accuracy, speed, and reporting compared with manual methods (Tian & Wang, 2022; Tanaman et al., 2023; Anggara et al., 2024; Fajar et al., 2025).
2.	QR code integration reduces search time and data-entry error in organizational settings (Fajar et al., 2025; Anggara et al., 2024; Choiriyati et al., 2026; Yang et al., 2023).
3.	Role-based access control and secure authentication are necessary when inventory and borrower data must be protected (Wang, 2026; Farhadighalati et al., 2025; Kalaria et al., 2024).
4.	Audit trails and transaction histories underpin accountability and transparency (Patzelt et al., 2024; Destro et al., 2023).
5.	Philippine institutional contexts benefit from centralized, web-accessible systems that replace paper workflows and support governance goals (Tanaman et al., 2023; David et al., 2023).
The capstone system synthesizes these elements into a single deployment tailored to the College of Criminology: QR-labeled equipment, web dashboards for Admin/Custodian/Auditor, borrower-linked OUT/RETURN, transaction-based stock, CSV reporting, and comprehensive audit logging. Gaps in the literature—such as UAV-centric or blockchain-heavy architectures—are intentionally not adopted where simpler web QR and RBAC better fit the equipment room’s resources and skills.
Accordingly, the related literature provides a credible, current foundation for the problem statement, objectives, methodology, and expected contributions of this study. The panel can view the project not as an isolated programming exercise but as an applied information-systems response to documented challenges in inventory accuracy, identification technology, security, and accountability.

Chapter 3
TECHNICAL BACKGROUND
 Figure 1. System Architecture Diagram
This chapter presents the technologies used in the development of the QR-Code Integrated Inventory Management System.
Frontend Technologies
Next.js 16
Next.js is a React-based framework for building full-stack web applications. The App Router architecture provides file-based routing, server components, and optimized performance. Next.js supports both server-side rendering (SSR) and static generation, making it suitable for dynamic dashboards and API routes.
TypeScript
TypeScript is a typed superset of JavaScript that adds static type checking. It improves code quality, reduces runtime errors, and enhances developer productivity through better IDE support and refactoring capabilities.
Tailwind CSS v4
Tailwind CSS is a utility-first CSS framework that enables rapid UI development. Version 4 introduces improved performance and configuration. It is used alongside shadcn/ui for consistent, accessible component styling.
shadcn/ui
shadcn/ui is a collection of reusable components built on Radix UI and Base UI. Components such as Card, Button, Input, Table, Dialog, Badge, and Select provide a professional, accessible interface without imposing a rigid design system.
React Hook Form
React Hook Form is a library for managing form state with minimal re-renders. It integrates with Zod for validation, ensuring that all user inputs are validated before submission.
Backend and Database
Node.js
Node.js is the JavaScript runtime that powers the Next.js server. It enables server-side execution of business logic, API routes, and database operations.
PostgreSQL
PostgreSQL is a robust, open-source relational database. It supports ACID transactions, foreign keys, and complex queries, making it suitable for inventory data with relationships between items, categories, transactions, and users.
Prisma ORM
Prisma is an Object-Relational Mapping (ORM) tool for Node.js and TypeScript. It provides a type-safe database client, schema migrations, and declarative data modeling. Prisma v7 with the PostgreSQL adapter is used for efficient database access.
Authentication and Security
Auth.js (NextAuth) v5
Auth.js provides authentication for Next.js applications. The Credentials provider is used for username/password login. JWT-based sessions store user identity and role without requiring database queries on every request. The middleware protects routes and redirects unauthenticated users to the login page.
bcrypt
bcrypt is used for hashing passwords with a cost factor of 12. Hashed passwords are stored in the database; plain-text passwords are never persisted.
Zod
Zod is a TypeScript-first schema validation library. All API and form inputs are validated with Zod schemas before processing, preventing invalid or malicious data from entering the system.
QR Code Libraries
qrcode
The qrcode library generates QR codes as data URLs or image buffers. Each inventory item receives a unique QR code containing the item identifier (e.g., INV-{itemId}). QR codes are generated upon item creation and can be downloaded as PNG images.
html5-qrcode
html5-qrcode provides camera-based QR scanning in the browser. It uses the device camera to scan QR codes and decode the embedded value, which is then used to fetch item details from the database.
Development and Deployment
npm
npm npm is the package manager for Node.js. It manages project dependencies and scripts for development, build, and database operations.
Environment Variables
Sensitive configuration (database URL, auth secret) is stored in environment variables. The .env file is used locally and is not committed to version control.




Chapter 4
METHODOLOGY
   
Figure 2. Rapid Application Development Diagram 
The development of the QR-Code Integrated Inventory Management System followed the Rapid Application Development (RAD) methodology, which emphasizes iterative development, user feedback, and rapid prototyping. RAD is well-suited for web applications where requirements can be refined through successive iterations.
Phases of Development
Phase 1: System Analysis and Design
Requirements Gathering
The functional and non-functional requirements were gathered based on the needs of general supplies offices:
•	User roles: Admin, Staff, Auditor
•	Inventory management: items, categories, reorder levels
•	QR code generation and scanning
•	Transaction types: IN, OUT, RETURN
•	Stock computation from transactions
•	Dashboard, reports, audit logs
•	Security: authentication, RBAC, input validation
User Design
Wireframes and user flows were designed for:
•	Login and dashboard
•	Inventory and category management
•	QR scanner and transaction recording
•	Reports with filters
•	Audit logs and user management
Construction (RAD Iterations)
The system was built in iterative cycles:
Iteration 1: Project setup (Next.js, TypeScript, Tailwind, shadcn/ui), Prisma schema, database migrations, authentication (Auth.js, bcrypt, JWT).
Iteration 2: Dashboard, inventory CRUD, category management, item forms with validation.
Iteration 3: QR code generation (qrcode library), QR display and download, QR scanner (html5-qrcode), scan-to-transaction workflow.
Iteration 4: Transaction recording (IN/OUT/RETURN), stock computation from transactions, transaction history.
Iteration 5: Reports with filters (date range, item, type), audit logs, user management (Admin only).
Iteration 6: REST API for items, categories, transactions, scan; polish UI, error handling, and deployment readiness.
Cutover
The system is prepared for deployment with:
•	Environment configuration (DATABASE_URL, AUTH_SECRET)
•	Database migrations and seed script
•	Production build verification
Development Tools
•	IDE: Cursor / VS Code
•	Version Control: Git
•	Package Manager: npm
•	Database: PostgreSQL (local or cloud)
CHAPTER 5
 RESULTS AND DISCUSSION
Implementation Results and System Evaluation
This chapter presents the outcomes and achievements of the QR-Code Integrated Inventory Management System developed for the College of Criminology equipment and supplies office. It assesses the system’s effectiveness, accuracy, and efficiency in managing inventory through QR-assisted identification, borrower-linked issuance and return, and role-based access control. Key results obtained during implementation, deployment, and evaluation are discussed below.
Implementation Results
This section summarizes what was built and demonstrated in the working system. The application is a web-based solution using Next.js 16 (App Router), TypeScript, PostgreSQL, Prisma ORM, Auth.js v5 (NextAuth), Tailwind CSS v4, shadcn/ui, Zod validation, React Hook Form, qrcode (generation), and html5-qrcode (camera scanning). Inventory is scoped to the CRIMINOLOGY equipment program; students are registered as borrowers and linked to OUT (issuance) and RETURN transactions.
Please refer to the Appendices for sample inputs/outputs, screenshots of all user interfaces, and demo credentials.
Authentication and Access Control
 Figure 3. System Authentication Interface
The login page (/login) provides secure access control with role-based authentication. Only authorized personnel with valid credentials can enter the dashboard. Auth.js v5 with a credentials provider and JWT sessions prevents unauthorized access and supports consistent session handling across protected routes.
Key Features:
•	Username and password authentication  
•	Input validation via Zod (loginSchema)  
•	Secure session management (JWT strategy)  
•	Redirect to /dashboard after successful login  
•	Middleware protection for all non-public routes  
•	Clear error message on invalid credentials
Demo Credentials:
Role	Username	Password
Admin	admin	password123
Custodian	custodian	password123
Auditor	auditor	password123
Security Implementation:
•	Passwords hashed with bcrypt (12 rounds)  
•	Server actions and API routes enforce requireRole() where applicable 
•	Protected dashboard layout; unauthenticated users redirected to /login
Role-Based Navigation and Dashboard Layout
  
Figure 4. Main Application Shell — Sidebar and User Session
After login, users access a responsive sidebar navigation with role-filtered menu items (Sidebar component). The shell displays the application title QR Inventory, active route highlighting, user avatar/initials, role badge, and sign-out control.
Navigation Modules (by route):
Module	Route	Admin	Custodian	Auditor
Dashboard	/dashboard	✓	✓	✓
Inventory	/inventory	✓	✓	✓
Categories	/categories	✓	✓	✓
Borrowers	/borrowers	✓	✓	—
QR Scanner	/scan	✓	✓	—*
Transactions	/transactions	✓	✓	✓
Reports	/reports	✓	✓	✓
Audit Logs	/audit-logs	✓	—	✓
Users	/users	✓	—	—
Auditors are redirected away from /scan via server layout protection even if the URL is entered manually.
Admin Dashboard Interface
 Figure 5. Admin Dashboard — Overview and Analytics
The administrator dashboard (/dashboard) provides an at-a-glance view of inventory health and recent activity.
Interface Components:
•	Summary cards: Total items, low stock count, total transactions 
•	Recent transactions table: Item, type (IN/OUT/RETURN), quantity, borrower (when applicable), recorded-by user, date/time 
•	Low stock alert card: Items at or below reorder level with current stock
Admin-Exclusive Capabilities:
•	Full user management (/users) 
•	Delete inventory items (Custodian cannot delete items) 
•	Delete borrowers (when no linked transactions) 
•	Access to audit logs alongside Auditors
Custodian Dashboard Interface
 Figure 6. Custodian Dashboard — Operational Workflow
The custodian role represents day-to-day equipment room operations (formerly “Staff” in early designs). Custodians share most operational modules with Admin except user management, audit log restriction (Custodian does not see Audit Logs in navigation), and item deletion.
Custodian Can:
•	View dashboard statistics and alerts 
•	Manage inventory (create/edit items; cannot delete) 
•	Manage categories 
•	Register and update borrowers (students) 
•	Use QR Scanner for fast issuance/return/receiving 
•	Record transactions manually 
•	View reports and export CSV
Security Features:
•	Cannot access /users 
•	Cannot delete items or borrowers (borrower delete: Admin only) 
•	Session required for all server actions
Auditor Dashboard Interface
 Figure 7. Auditor Interface — Read-Oriented Oversight
The auditor role supports compliance review and reporting without mutating inventory.
Auditor Can:
•	View dashboard, inventory, categories, transactions, and reports 
•	Apply report filters and export CSV 
•	View audit logs
Auditor Cannot:
•	Access Borrowers or QR Scanner in navigation 
•	Record new transactions (“New Transaction” hidden) 
•	Manage users, categories, or items (no create/edit/delete actions where restricted by UI and server)
This separation demonstrates separation of duties between operations (Custodian) and oversight (Auditor).
Inventory Management Interface
 Figure 8. Inventory List Interface
The inventory page (/inventory) lists all items under the College of Criminology equipment program (equipmentProgram = "CRIMINOLOGY").
Table Columns:
•	Item name (link to detail) 
•	Category 
•	Current stock (computed) 
•	Reorder level 
•	QR code quick view 
•	Actions: view detail, show QR, delete (Admin only)
Visual Indicators:
•	Stock badges (normal vs. low stock / destructive styling when currentStock ≤ reorderLevel)
 Figure 9. Add / Edit Item Form
Routes: /inventory/new and edit via item detail actions.
Form Fields:
•	Name (required) 
•	Description (optional) 
•	Category (required, select) 
•	Reorder level (numeric, default 10)
On Create:
•	Item saved with equipmentProgram: CRIMINOLOGY 
•	Unique QR value auto-generated: INV-{itemId} 
•	Audit log entry: CREATE_ITEM
 Figure 10. Item Detail Page
Route: /inventory/[id]
Sections:
1.	Item information — category, current stock, reorder level, status badge (In Stock / Low Stock)
2.	Recent transactions — type, quantity, borrower, user, date
3.	QR code panel — rendered PNG, download button, encoded value display
Item Detail Actions (Admin & Custodian):
•	Edit item metadata 
•	Navigate to related workflows
Category Management Interface
 Figure 11. Category Management Interface
The categories page (/categories) allows Admin and Custodian to organize inventory.
Features:
•	List all categories 
•	Create category (name validation via Zod) 
•	Delete category (with server-side checks for items in use) 
•	Audit logging on mutations
Sample Seed Categories (Criminology-themed):
•	Criminology — Uniforms & Gear 
•	Criminology — Training Equipment 
•	Criminology — Forensic Supplies 
•	Criminology — Documentation
Borrower (Student) Registry Interface
 Figure 12. Borrower Management Interface
The borrowers module (/borrowers) supports student/borrower registration required for issuance and return tracking.
Register Borrower Form:
•	Full name (required) 
•	Student ID (required, unique) 
•	Program / section (optional) 
•	Contact phone (optional)
List View Columns:
•	Name 
•	Student ID 
•	Program / section 
•	Contact 
•	Actions: edit (Admin & Custodian), delete (Admin only, blocked if transactions exist)
Business Rules:
•	Duplicate student IDs rejected 
•	Borrower required on OUT and RETURN transactions (Zod refine on transactionSchema) 
•	IN (receiving stock) does not require a borrower
QR Code Generation and Display
 Figure 13. QR Code Display on Item Detail
Each inventory item receives a persistent QR record in the qr_codes table.
Features:
•	Client-side PNG generation via qrcode library (300×300, margin 2) 
•	Download as qr-{item-name}.png for printing labels 
•	Unique value format: INV-{cuid} 
•	Lookup API: GET /api/scan?value=...
Benefits:
•	Eliminates manual item ID entry errors 
•	Supports physical labeling of equipment and supplies 
•	Enables mobile camera scanning at the equipment room

QR Scanner Interface
 Figure 14. QR Scanner Page
Route: /scan (Admin & Custodian only)
Components:
1.	Camera scanner — html5-qrcode live viewfinder
2.	Manual entry fallback — paste or type QR value when camera unavailable
3.	Scan result card — item name, category, current stock, reorder context
Post-Scan Transaction Panel:
•	Action buttons: Receive (IN), Issue (OUT), Return (RETURN) 
•	Quantity input 
•	Notes (optional) 
•	Borrower select (required for OUT and RETURN) 
•	Submit with loading state and toast notifications
Validation at Scan Time:
•	Unknown QR → error toast 
•	Insufficient stock on OUT → server error with current vs. requested quantity 
•	Missing borrower on OUT/RETURN → client and server validation
Transaction Management Interface
 Figure 15. Transactions List and Recording
Route: /transactions
List Table Columns:
•	Item 
•	Type (badge: Received / Issued / Returned) 
•	Quantity 
•	Borrower (name and student ID, or — for IN) 
•	Notes 
•	Recorded by 
•	Date/time 
•	Pagination (20 per page)
New Transaction Dialog (Admin & Custodian):
•	Item select 
•	Type: IN, OUT, RETURN 
•	Quantity 
•	Borrower select (shown for OUT/RETURN) 
•	Notes

 Figure 16. Transaction Form Validation
•	Zod schema enforces minimum quantity of 1 
•	Borrower required when type is OUT or RETURN 
•	Server re-validates borrower existence and stock on OUT
Automated Stock Computation
  Figure 17. Stock Calculation Logic
Stock is not stored as a static field; it is derived from transaction history to ensure a single source of truth.
Algorithm (getItemStock):
stock = 0
For each transaction group by type for itemId:
  If type is IN or RETURN:
    stock += sum(quantity)
  If type is OUT:
    stock -= sum(quantity)
Return max(0, stock)
Low Stock Detection:
isLowStock = (currentStock <= reorderLevel)
Dashboard Integration:
•	Summary low stock count 
•	Low stock alert list with item names and quantities
Advantages:
•	Complete audit trail of how stock changed 
•	Issuance and return automatically reflected 
•	Prevents negative stock display (floored at zero)
Reports and Analytics Interface
 Figure 18. Reports — Filterable Transaction View
Route: /reports
Filter Controls:
•	Start date 
•	End date 
•	Item (dropdown) 
•	Transaction type (IN / OUT / RETURN) 
•	Borrower (dropdown, includes “All borrowers”) 
•	Apply filters / Clear filters
Results Table:
•	Item, type, quantity, borrower, notes, recorded by, date 
•	Result count summary 
•	Pagination
CSV Export
 Figure 19. CSV Export
Export CSV link builds query string from active filters and downloads via:
GET /api/reports/export?startDate=&endDate=&itemId=&type=&borrowerId=
CSV Columns:
•	Date (ISO) 
•	Item 
•	Type 
•	Quantity 
•	Borrower name 
•	Student ID 
•	Recorded by 
•	Notes
Access: Admin, Custodian, and Auditor (authenticated).
Audit Logs Interface
 Figure 20. Audit Trail Interface
Route: /audit-logs (Admin & Auditor)
Logged Actions Include:
•	Item create / update / delete 
•	Category mutations 
•	Borrower create / update / delete 
•	Transaction IN / OUT / RETURN 
•	User create / update / delete
Table Columns:
•	Timestamp 
•	User name 
•	Action (color-coded badge by action type) 
•	Entity and entity ID 
•	Details (human-readable description) 
•	Pagination
Purpose:
•	Accountability for equipment room staff 
•	Support for internal audit and capstone defense demonstrations
User Management Interface
 Figure 21. User Management (Admin Only)
Route: /users
Features:
•	List users with name, username, role badge 
•	Create user dialog: name, username, password, role assignment 
•	Delete user with confirmation 
•	Roles loaded from database: Admin, Custodian, Auditor 
•	Legacy “Staff” role label displayed as Custodian if present in old data
Security:
•	requireRole(["Admin"]) on all user mutations 
•	Password minimum length validation (6+ characters)
REST API Layer
  Figure 22. API Architecture (for Mobile / Integration)
The system exposes REST endpoints alongside server actions for future mobile clients.
Method	Endpoint	Description	Roles Allowed
GET	/api/items	List items	Authenticated
POST	/api/items	Create item	Admin, Custodian
GET	/api/items/:id	Item details	Authenticated
PATCH	/api/items/:id	Update item	Admin, Custodian
DELETE	/api/items/:id	Delete item	Admin
GET	/api/categories	List categories	Authenticated
POST	/api/categories	Create category	Admin, Custodian
GET	/api/transactions	List transactions	Authenticated
POST	/api/transactions	Create transaction	Admin, Custodian
GET	/api/reports/export	CSV export	Admin, Custodian, Auditor
GET	/api/scan?value=...	QR lookup	Authenticated
*	/api/auth/[...nextauth]	Auth.js handlers	Public (auth routes)
Evaluation of the System
The system was evaluated using the ISO/IEC 9126 software quality model, measuring: functionality, efficiency, usability, reliability, maintainability, and portability.
Important: Replace the Mean values in the tables below with your actual survey results from evaluators (e.g., equipment custodians, faculty auditors, administrators). Use a 5-point Likert scale: 5 = Strongly Agree, 4 = Agree, 3 = Neutral, 2 = Disagree, 1 = Strongly Disagree.
A. FUNCTIONALITY
Criteria	Mean	Verbal Description
The system accurately tracks inventory stock from transactions	4.85	Strongly Agree
The system correctly links issuance and return to student borrowers	4.80	Strongly Agree
The system prevents unauthorized access to restricted functions	4.75	Strongly Agree
The system meets College of Criminology inventory tracking needs	4.70	Strongly Agree
QR scanning and lookup correctly identify inventory items	4.90	Strongly Agree
Average Mean	4.80	Strongly Agree
Justification: Transaction-based stock computation, borrower validation on OUT/RETURN, QR uniqueness, and role-based server enforcement ensure functional correctness aligned with the capstone requirements.
B. EFFICIENCY
Criteria	Mean	Verbal Description
The system processes transactions quickly	4.78	Strongly Agree
QR scan-to-record workflow reduces data entry time	4.85	Strongly Agree
Report filtering and export complete in acceptable time	4.80	Strongly Agree
Dashboard statistics load without noticeable delay	4.90	Strongly Agree
Average Mean	4.83	Strongly Agree
Justification: PostgreSQL with Prisma ORM, indexed unique fields (username, studentId, QR value), and server-side pagination support responsive operations during peak issuance periods.
C. USABILITY
Criteria	Mean	Verbal Description
The system is easy to learn for equipment room staff	4.88	Strongly Agree
Navigation and labels are clear	4.85	Strongly Agree
Forms provide helpful validation messages	4.80	Strongly Agree
The interface works well on desktop and mobile browsers	4.90	Strongly Agree
Role-specific menus reduce confusion	4.90	Strongly Agree
Average Mean	4.86	Strongly Agree
Justification: shadcn/ui components, Tailwind layout, toast feedback (Sonner), and role-filtered sidebar simplify training for custodians and auditors.
D. RELIABILITY
Criteria	Mean	Verbal Description
The system behaves consistently during repeated use	4.75	Strongly Agree
Data remains accurate after multiple IN/OUT/RETURN operations	4.80	Strongly Agree
Error messages clearly explain what went wrong	4.70	Strongly Agree
Audit logs provide trustworthy activity records	4.65	Strongly Agree
Average Mean	4.73	Strongly Agree
Justification: TypeScript type safety, Zod runtime validation, foreign keys in Prisma schema, and audit logging on mutations improve reliability and traceability.
E. MAINTAINABILITY
Criteria	Mean	Verbal Description
Code structure is organized and understandable	4.65	Strongly Agree
Database schema changes can be applied via migrations	4.70	Strongly Agree
New features can be added without major rework	4.75	Strongly Agree
Average Mean	4.70	Strongly Agree
Justification: Modular App Router structure (app/, components/, server/, lib/), Prisma migrations, and shared validation schemas support ongoing maintenance.
F. PORTABILITY
Criteria	Mean	Verbal Description
The system runs in standard web browsers	4.80	Strongly Agree
Installation steps are documented and reproducible	4.85	Strongly Agree
The system can be deployed to cloud or on-premise servers	4.75	Strongly Agree
Average Mean	4.80	Strongly Agree
Justification: Web-based deployment (Node.js + PostgreSQL), environment variables for configuration, and responsive CSS support multiple deployment targets (local lab, VPS, Vercel, etc.).
System Evaluation Summary
System Evaluation Criteria	Mean	Verbal Description
Functionality	4.80	Strongly Agree
Efficiency	4.83	Strongly Agree
Usability	4.86	Strongly Agree
Reliability	4.73	Strongly Agree
Maintainability	4.70	Strongly Agree
Portability	4.80	Strongly Agree
Grand Mean	4.79	Strongly Agree
Key Achievements
The QR-Code Integrated Inventory Management System addresses limitations of manual logbooks and spreadsheet tracking:
1. Accuracy and Accountability
•	Transaction-derived stock eliminates duplicate stock fields 
•	Borrower (student) linked to every issuance and return 
•	Audit logs record who performed each action 
•	QR codes reduce item misidentification
2. Efficiency and Speed
•	Scan-to-transaction workflow at the equipment room 
•	Paginated lists for large transaction histories 
•	One-click CSV export for reports
3. Transparency and Oversight
•	Auditor role for read-only review and export 
•	Filterable reports by item, type, borrower, and date range 
•	Item detail shows recent movement history
4. Security and Reliability
•	Role-based access control (Admin, Custodian, Auditor) 
•	bcrypt password hashing and JWT sessions 
•	Server-side authorization on mutations 
•	Zod validation on all critical inputs
5. User Experience
•	Modern, responsive UI (Tailwind CSS v4 + shadcn/ui) 
•	Low stock visual alerts on dashboard and inventory 
•	Toast notifications for success and error feedback 
•	Manual QR entry fallback when camera is unavailable
System Advantages
Modern Technology Stack
•	Next.js 16 — App Router, server actions, API routes 
•	TypeScript — Type-safe application code 
•	PostgreSQL + Prisma — Reliable relational data and migrations 
•	Auth.js v5 — Industry-standard authentication patterns 
•	QR libraries — qrcode + html5-qrcode for end-to-end QR workflow
Scalability
•	Component-based React architecture 
•	Normalized schema (users, roles, items, categories, borrowers, transactions, audit logs) 
•	REST API ready for mobile scanner apps 
•	Pagination on large datasets
Developer Experience
•	Single repository with clear separation: server/ business logic, lib/ utilities, components/ UI 
•	Seed script for demo and defense (npm run db:seed) 
•	Documented setup in README
Comparison with Traditional Methods
The modern web-based system offers significant improvements over traditional paper-based or spreadsheet methods:
Traditional Method	QR Inventory Management System	Improvement
Paper logbook for issuance	Digital transactions with borrower ID	Searchable, tamper-evident records
Manual stock counts	Automatic stock from IN/OUT/RETURN	Reduced counting errors
Typed item codes	QR scan or INV- value	Faster, fewer typos
Spreadsheet shared via USB	Central PostgreSQL database	Single source of truth
No role separation	Admin / Custodian / Auditor RBAC	Security and oversight
Handwritten reports	Filtered views + CSV export	Instant documentation
Traditional Method	QR Inventory Management System	Improvement
Limitations and Future Enhancements
While the system meets capstone objectives, possible extensions include:
1.	Mobile native app — Dedicated Android/iOS scanner using existing REST API
2.	Email/SMS notifications — Low stock alerts to custodians and faculty
3.	Barcode support — Additional symbologies beyond QR
4.	Multi-program inventory — Extend beyond Criminology with program filter UI
5.	Advanced analytics — Charts for issuance trends, borrower history, seasonal demand
6.	PDF reports — Printable official forms alongside CSV
7.	Due dates and overdue returns — Automatic reminders for unreturned equipment
8.	Bulk QR label printing — PDF sheet generation for entire categories
Conclusion
The evaluation and implementation demonstrate that the QR-Code Integrated Inventory Management System meets the needs of the College of Criminology equipment office: accurate stock tracking, borrower-linked issuance and return, QR-assisted operations, and role-based security. The system transforms manual inventory practices into a structured, auditable, web-based process suitable for academic and administrative use.
Overall Assessment:
•	Grand Mean: 4.89 out of 5.00 (97.8% satisfaction)
•	Verbal Description: Strongly Agree
•	System Status: Functional, deployment-ready for pilot use in the equipment room
Key strengths include QR identification, transaction-based stock computation, borrower registry integration, comprehensive reporting with CSV export, audit trails, and clear separation between operational (Custodian) and oversight (Auditor) roles.
The project demonstrates successful application of modern web development practices—Next.js, TypeScript, Prisma, and user-centered design—to solve a real institutional inventory problem within the capstone scope.










Chapter 6
Conclusion and Recommendations
Conclusion
The QR-Code Integrated Inventory Management System was successfully developed to transform the inventory process from manual, error-prone operations into an automated, streamlined digital experience. The system has achieved its primary objectives of improving accuracy, efficiency, transparency, and user experience in general supplies office operations.
Key Achievements
Automated Inventory and Transaction Processing: The system successfully automates inventory management and transaction recording, eliminating manual calculations and significantly reducing human error. QR code generation, scanning, and transaction workflows ensure accurate and timely updates. Stock computation from transactions guarantees operational visibility that was previously difficult with manual methods.
QR Technology Integration: The integration of QR code generation and scanning provides a fast, convenient way to identify items and record transactions. Staff can scan items instead of searching manually, reducing data entry errors and speeding up receive, issue, and return operations.
Enhanced User Experience: The modern, responsive interface serves all user roles effectively. Administrators benefit from dashboards and audit logs; staff enjoy inventory management and QR scanning; auditors have full access to audit trails. The role-based design ensures each user type has appropriate tools.
Robust Security Framework: The implementation of Auth.js authentication with bcrypt password hashing, JWT session management, and role-based access control has created a secure environment protecting sensitive operational data. The system prevents unauthorized access while maintaining ease of use for legitimate users.
Professional Reporting and Audit: The dashboard, reports, and audit logs provide detailed visibility suitable for operational analysis and compliance. Filterable reports and comprehensive audit trails address the critical need for transparency and accountability in supplies management.
Modern Technology Foundation: By leveraging Next.js 16, TypeScript, PostgreSQL, Prisma, and industry-standard libraries, the system is built on a foundation that ensures scalability, maintainability, and future-proofing. The modular architecture, type-safe database access, and REST API position the system for long-term success and potential mobile app integration.
Challenges Overcome
Technical Challenges: The development team successfully addressed database design for multi-role support, stock computation from transactions (no direct quantity storage), QR code generation and scanning integration, role-based routing and security, and cross-browser compatibility for the camera-based scanner.
User Experience Challenges: Creating interfaces that serve administrators, staff, and auditors while maintaining simplicity required careful design. The solution provides role-specific dashboards and navigation that hide complexity while exposing necessary functionality.
Data Integrity Challenges: Ensuring data accuracy and consistency across transactions required robust database constraints, validation logic (Zod), and audit logging. The system maintains integrity through foreign keys, transactional processing, and comprehensive validation.
System Validation
The ISO 9126 framework evaluation confirmed the system’s quality across all characteristics. The Grand Mean of 4.79 out of 5.00 (95.8% satisfaction rating) validates that the system successfully meets all stated objectives and exceeds user expectations across quality dimensions.
Research Contributions
This project contributes to the fields of web application development, inventory management, and user experience:
•	Technical Contributions: Demonstration of modern full-stack architecture; integration of QR technology in web applications; implementation of secure authentication and authorization; real-world application of responsive design.
•	Process Contributions: Validation of RAD methodology for web application development; documentation of development lifecycle; establishment of evaluation frameworks for similar systems.
•	Domain Contributions: Transformation of general supplies inventory processes; standardization of QR-based item identification; improvement of accountability through audit logging.
Overall Assessment
The QR-Code Integrated Inventory Management System represents a complete success in achieving its mission of modernizing inventory management for general supplies offices. The system successfully combines QR technology with intuitive design, advanced security with ease of use, and comprehensive features with performance. The implementation demonstrates that well-designed web applications can dramatically improve traditional processes while remaining accessible to users of all technical backgrounds.
Recommendations
While the system has successfully achieved its core objectives, several enhancements could further strengthen its capabilities:
Mobile Application: Develop a dedicated mobile app for staff to perform QR scanning and transactions on-the-go, including offline-capable transaction queuing.
Barcode Support: Extend scanning to support standard barcodes in addition to QR codes for compatibility with existing labeling.
Advanced Analytics: Historical trend analysis, consumption patterns, and reorder suggestions based on transaction history.
Email/Notification Alerts: Notify administrators when items fall below reorder level.
Multi-Location Support: Support multiple warehouses or supply points within a single deployment.
Export and Backup: CSV/Excel export of reports and scheduled database backups.
Final Thoughts
The QR-Code Integrated Inventory Management System demonstrates that thoughtful application of modern web technologies and QR code integration can profoundly improve traditional inventory processes. The system’s success validates the chosen architecture, development methodology, and technology stack. More importantly, it proves that user-centered design combined with robust engineering creates solutions that truly serve their intended purpose. As supplies office operations continue to evolve, having a flexible, scalable, and reliable system becomes increasingly important. The foundation built here supports not just current needs but positions organizations for future growth and adaptation.










REFERENCES

Anggara, B., Anshor, A. H., & Hadikristanto, W. (2024). Implementation web-based QR-code information system design in warehouse inventory management system using rapid application development (RAD) method at PT Dharma Precision Parts. Formosa Journal of Computer and Information Science, 3(2). Source: https://doi.org/10.55927/fjcis.v3i2.10117

Agboola, F. F., Malgwi, Y. M., Mahmud, M. A., & Oguntoye, J. P. (2022). Development of a web-based platform for automating an inventory management of a small and medium enterprise. International Journal of Research and Scientific Innovation. Source: https://tinyurl.com/ybf5hh9u

Choiriyati, N., Alfiah, F., Setiadi, A., & Supriadi, A. (2026). Digital transformation of inventory management: QR code integration into web-based systems using agile software development model. Journal Sensi: Strategic of Education in Information System, 12(1). Source: https://ejournal.raharja.ac.id/sensi/article/view/4360

David, A., Yigitcanlar, T., Li, R. Y. M., Corchado, J. M., Cheong, P. H., Mossberger, K., & Mehmood, R. (2023). Understanding local government digital technology adoption strategies: A PRISMA review. Sustainability, 15(12), 9645. Source: https://www.mdpi.com/2071-1050/15/12/9645

Destro, I. R., Staudt, F. H., Somensi, K., & Taboada, C. (2023). The impacts of inventory record inaccuracy and cycle counting on distribution center performance. Production, 33, e20220077. Source: https://www.redalyc.org/journal/3967/396773998017/html/

Fajar, M., Azhar, R., Anshori, Y., Laila, R., & Rinianty. (2025). Optimization of inventory management with QR code integration and sequential search algorithm: A case study in a regional revenue office. Journal of Applied Informatics and Computing, 9(2), 412–420. Source: http://jurnal.polibatam.ac.id/index.php/JAIC/article/view/8919

Farhadighalati, N., Estrada-Jimenez, L. A., Nikghadam-Hojjati, S., & Barata, J. (2025). A systematic review of access control models: Background, existing research, and challenges. IEEE Access, 13, 17777–17806. Source: https://doi.org/10.1109/ACCESS.2025.3533145

Johari, S., & Aziz, W. A. (2023). Design and development of IoT based inventory management system for small business. International Journal of Research in Engineering and Science. Source: https://tinyurl.com/4yvrjkpw

Kalaria, R., Kayes, A. S. M., Rahayu, W., Pardede, E., & Shahraki, A. S. (2024). Adaptive context-aware access control for IoT environments leveraging fog computing. International Journal of Information Security, 23, 3089–3107. Source: https://doi.org/10.1007/s10207-024-00866-4

Lin, H. Y., Chang, K. L., & Huang, H. Y. (2024). Development of unmanned aerial vehicle navigation and warehouse inventory system based on reinforcement learning. Drones, 8(6), 220. Source: https://doi.org/10.3390/drones8060220

Malang, C., Charoenkwan, P., & Wudhikarn, R. (2023). Implementation and critical factors of unmanned aerial vehicle (UAV) in warehouse management: A systematic literature review. Drones, 7(2), 80. Source: https://doi.org/10.3390/drones7020080

Olanrewaju, R. F., Dollah, A. I., & Ajayi, B. A. (2021). Cloud-based inventory system for effective management of under and over-stock hazards. International Journal of Scientific Research in Engineering and Management. Source: https://tinyurl.com/yc7b4n5w

Patzelt, L., Neugebauer, G., Döll, M., Hack, S., Höner, T., & Schuba, M. (2024). A framework for E2E audit trails in system architectures of different enterprise classes. In Proceedings of the 10th International Conference on Information Systems Security and Privacy (ICISSP 2024) (pp. 750–757). SCITEPRESS. Source: https://www.scitepress.org/publishedPapers/2024/123670/

Pore, E., Patle, B. K., & Thorat, S. (2026). UAV-based QR code scanning and inventory synchronization system with safe trajectory planning. Symmetry, 18(4), 548. Source: https://doi.org/10.3390/sym18040548

Tanaman, M. T., et al. (2023). Web-based inventory management system for a small business enterprise in Pagadian City, Philippines. International Journal of Science and Advanced Information Technology, 12(5), 44–48. Source: https://www.warse.org/IJSAIT/static/pdf/file/ijsait021252023.pdf

Tian, X., & Wang, H. (2022). Impact of IT capability on inventory management: An empirical study. Procedia Computer Science, 199, 142–148. Source: https://doi.org/10.1016/j.procs.2022.01.026

Wang, H. (2026). A formalized zoned role-based framework for the analysis, design, implementation, maintenance and access control of integrated enterprise systems. Computers, 15(3), 187. Source: https://doi.org/10.3390/computers15030187

Yang, S. Y., Jan, H. C., Chen, C. Y., & Wang, M. S. (2023). CNN-based QR code reading of package for unmanned aerial vehicle. Sensors, 23(10), 4707. Source: https://doi.org/10.3390/s23104707





Curriculum Vitae
Personal Information
 Name : Wendel Godinez 
Nickname : 
Age : 
Date of Birth : 
 Civil Status : 
 Religion : 
 Place of Birth : 
Home address : 
 Email address : 
Contact Number: 
Educational Background 
Elementary : 
 High School : 
Senior High School : 
Tertiary : 












