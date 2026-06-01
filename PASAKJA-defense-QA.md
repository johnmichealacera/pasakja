# PASAKJA — Capstone Defense Possible Questions & Answers
### English and Bisaya (Cebuano) | Pasakja: A Web-Based Community Transportation Booking & Dispatching System

---

## HOW TO USE THIS GUIDE

Study each question carefully. Understand the **reason** why panelists ask it — this helps you answer confidently even if the wording is slightly different during the actual defense. Practice answering in both English and Bisaya so you are ready for either language.

---

---

## QUESTION 1 — Why did you choose this topic?

**Why this will be asked:** This is almost always the first or second question in any defense. Panelists want to know if the researchers have a genuine, community-rooted reason for developing the system — not just because it was easy or trendy. A weak answer here undermines the entire study's significance.

---

**English Answer:**

We chose this topic because we personally observed the challenges faced by passengers and drivers in our community in Socorro, Surigao del Norte. Passengers often wait long periods without knowing when a ride will arrive, fares are unclear, and there is no organized system for dispatching. Drivers, on the other hand, have no reliable way to find passengers or track their income. Existing solutions like Grab and Joyride are only available in urban areas and do not serve small communities like ours. Pasakja was our response to these real and observable problems — to bring organized, digital transportation management to our community using modern web technology.

---

**Bisaya nga Tubag:**

Gipili namo kini nga topic tungod kay personal namo nga naobserbahan ang mga problema sa among komunidad dinhi sa Socorro, Surigao del Norte. Ang mga pasahero dugay mag-hulat og sakay ug wala silay kasayuran kung kanus-a moabot ang driver. Ang bayad dili klaro ug walay sistema sa pagpadala sa mga sakyanan. Ang mga driver usab lisod og pangita og mga pasahero ug wala sila'y paagi sa pag-monitor sa ilang kita. Ang mga sistema sama sa Grab ug Joyride anaa lang sa mga lungsod ug dili moabot sa gagmay nga komunidad sama sa amo. Si Pasakja ang among solusyon sa kini nga mga problema — aron madala ang organisado ug digital nga transportasyon sa among komunidad pinaagi sa modernong teknolohiya sa web.

---

---

## QUESTION 2 — Why did you develop a web-based system instead of a mobile application?

**Why this will be asked:** Panelists will notice that ride-hailing apps like Grab and Angkas are mobile apps, not websites. They will challenge why the researchers chose the web platform and whether it is practical for community use. This question tests the depth of the researchers' technical and practical decision-making.

---

**English Answer:**

We chose a web-based platform for several reasons. First, not all community members have the technical ability or storage space to download and install a mobile application. A web-based system only requires a browser and an internet connection, making it more accessible. Second, web development using Next.js allowed us to build both the front-end interface and the back-end API within a single project, which was more manageable given our time and resource constraints. Third, a web-based system can be accessed on any device — including smartphones — through the browser, so it still works on mobile. We also noted in our limitations that a mobile application is a recommended future enhancement once the system is deployed and proven in the community.

---

**Bisaya nga Tubag:**

Gipili namo ang web-based platform tungod sa daghang hinungdan. Una, dili tanan sa komunidad makadownload og app tungod sa limitado nga storage o teknikal nga kakayahan. Ang web-based system nagkinahanglan lang og browser ug internet, busa mas dali ma-access sa tanan. Ikaduha, ang paggamit sa Next.js nagtugot kanamo nga itukod ang front-end ug back-end nga managsama sa usa ka proyekto, nga mas dali alang sa among kapasidad sa panahon ug rekurso. Ikatulo, ang web-based system mahimong gamiton sa bisan unsang device — lakip ang smartphone — pinaagi sa browser, busa mobile-accessible pa gihapon kini. Ginaingon usab namo sa among mga limitasyon nga ang mobile application usa ka rekomendasyon alang sa sunod nga pagpalambo sa sistema.

---

---

## QUESTION 3 — How does the fare calculation work in your system?

**Why this will be asked:** Fare computation is one of the core features of Pasakja and directly affects both passengers and drivers. Panelists will test whether the researchers actually understand and can explain the logic behind it — not just that it "automatically computes" but how.

---

**English Answer:**

The fare calculation in Pasakja is based on a zone-and-distance model configured by the administrator. The administrator first creates a service zone and sets two values: a base fare, which is a flat starting amount, and a per-kilometer rate. When a passenger books a ride, the system uses the GPS coordinates of the pickup and drop-off locations to estimate the distance in kilometers. The quoted fare is then computed as:

**Fare = Base Fare + (Distance in km × Per-km Rate)**

This quoted fare is shown to the passenger before they confirm the booking. The administrator can update the base fare and per-km rate at any time through the Fare & Zones management page without any code changes.

---

**Bisaya nga Tubag:**

Ang pagkuwenta sa pamasahe sa Pasakja nakabase sa zone-and-distance nga modelo nga gi-configure sa administrator. Ang administrator magtukod og service zone ug magbutang og duha ka kantidad: ang base fare, nga usa ka piho nga panimula nga bayad, ug ang per-kilometer rate. Sa dihang mag-book ang pasahero og sakay, gigamit sa sistema ang GPS coordinates sa pickup ug drop-off aron matantiya ang distansya sa kilometro. Ang quoted fare kuwentahon ingon niini:

**Pamasahe = Base Fare + (Distansya sa km × Per-km Rate)**

Kini nga quoted fare ipakita sa pasahero sa wala pa niya kumpirmahon ang booking. Ang administrator makaupdate sa base fare ug per-km rate bisan unsang oras pinaagi sa Fare & Zones management page nga wala kinahanglana nga baguhin ang code.

---

---

## QUESTION 4 — How is GPS tracking implemented in your system?

**Why this will be asked:** GPS is prominently featured throughout the thesis. Panelists will want to know the technical specifics of how it was implemented. They may also probe whether the tracking is truly "real-time" or just coordinate capture, since live map rendering was listed as a future enhancement.

---

**English Answer:**

We implemented GPS in Pasakja using the Browser Geolocation API, which is a standard web interface built into modern browsers. When a passenger opens the booking page, the system requests permission to access the device's location. If granted, it captures the latitude and longitude coordinates and uses them as the default pickup location. The same API is used in the driver navigation page to display the passenger's pickup and drop-off coordinates. We store GPS coordinates as latitude and longitude values in the PostgreSQL database and display them in the trip map component. We want to be transparent that while the coordinates are captured in real time, a fully animated live-tracking map was identified as a future enhancement. The current implementation shows the pickup and drop-off pin locations on a static map view, which still provides meaningful location context for both drivers and passengers.

---

**Bisaya nga Tubag:**

Gi-implementar namo ang GPS sa Pasakja pinaagi sa Browser Geolocation API, nga usa ka standard nga web interface nga nagtukod sa modernong mga browser. Sa dihang maablihan sa pasahero ang booking page, ang sistema mangayo og permiso sa pag-access sa lokasyon sa device. Kung itugot, makuha ang latitude ug longitude coordinates ug gamiton kini isip default pickup location. Ang mao nga API gigamit usab sa driver navigation page aron ipakita ang pickup ug drop-off coordinates sa pasahero. Gitipig namo ang GPS coordinates isip latitude ug longitude nga mga kantidad sa PostgreSQL database ug ipakita sa trip map component. Gusto namo nga magmatinud-anon nga bisan real-time ang pag-capture sa coordinates, ang fully animated live-tracking map giila isip future enhancement. Ang kasamtangan nga implementasyon nagpakita sa pickup ug drop-off pin locations sa static map view, nga naghatag gihapon og mapuslanon nga lokasyon nga konteksto alang sa mga driver ug pasahero.

---

---

## QUESTION 5 — What is ISO 9126 and why did you use it to evaluate your system?

**Why this will be asked:** The evaluation framework is a standard panel question. Panelists want to verify that the researchers understand what ISO 9126 actually is and can explain each of its six criteria in the context of their system — not just recite a definition.

---

**English Answer:**

ISO/IEC 9126 is an international software quality standard that provides a framework for evaluating a software system based on six quality characteristics: Functionality, Efficiency, Usability, Reliability, Maintainability, and Portability. We chose this standard because it is widely recognized in academic capstone research in the Philippines and it comprehensively covers all dimensions of software quality that are relevant to our system. Functionality checks whether the system does what it is supposed to do. Efficiency measures how quickly it performs. Usability evaluates how easy it is for users to learn and operate. Reliability assesses consistency and error handling. Maintainability checks how easily it can be updated. Portability measures whether it can run across different environments and devices. We administered a 5-point Likert scale survey to selected evaluators — passengers, drivers, and administrators — and calculated the mean score for each criterion.

---

**Bisaya nga Tubag:**

Ang ISO/IEC 9126 usa ka internasyonal nga software quality standard nga naghatag og framework sa pag-evaluate sa sistema base sa anom ka quality characteristics: Functionality, Efficiency, Usability, Reliability, Maintainability, ug Portability. Gipili namo kini nga standard tungod kay kini kaylap nga giila sa akademikong capstone research sa Pilipinas ug komprehensibo kining nasakop sa tanang dimensyon sa kalidad sa software nga may kalabutan sa among sistema. Ang Functionality nagsusi kung ang sistema nagbuhat sa dapat niyang buhaton. Ang Efficiency nagsukod kung unsa kadali kini molihok. Ang Usability nag-evaluate kung unsa kadali kini gamiton sa mga user. Ang Reliability nagsusi sa konsistensya ug paghikap sa mga sayop. Ang Maintainability nagsusi kung unsa kadali kini i-update. Ang Portability nagsukod kung makapadagan kini sa lain-laing environment ug device. Nagpalabay kami og 5-point Likert scale survey ngadto sa mga piniling evaluator — mga pasahero, driver, ug administrator — ug gikuwenta ang mean score alang sa matag criterion.

---

---

## QUESTION 6 — What makes Pasakja different from existing apps like Grab, Joyride, or Angkas?

**Why this will be asked:** Since the thesis includes these commercial systems in the Review of Related Literature, panelists will directly challenge the researchers to articulate Pasakja's unique value and justify why a new system was needed rather than just using an existing one.

---

**English Answer:**

Grab, Joyride, and Angkas are consumer-focused mobile applications designed for large-scale commercial operation in urban areas. They are not available and do not serve small communities like Socorro, Surigao del Norte. Pasakja's key differentiator is that it is specifically designed for community-level transport management with a centralized administrative interface. While Grab and similar apps connect passengers directly to individual drivers without community oversight, Pasakja includes an Administrator role that allows a transport operator or community official to verify drivers, set fare zones and rates, monitor all bookings, manage SOS alerts, and view platform reports. This administrative control is something that Grab, Joyride, and Angkas do not offer to community operators. Additionally, Pasakja is web-based, making it accessible even without a dedicated mobile application.

---

**Bisaya nga Tubag:**

Ang Grab, Joyride, ug Angkas mga consumer-focused nga mobile application nga gihimo alang sa dako-dako nga komersyal nga operasyon sa mga lungsod. Wala kini maghatag og serbisyo sa gagmay nga komunidad sama sa Socorro, Surigao del Norte. Ang nag-lain sa Pasakja mao nga kini espesipikong gihimo alang sa community-level transport management nga adunay sentral nga administrative interface. Samtang ang Grab ug katulad nga mga app direkta rang nagkonektar sa pasahero ug driver nga walay oversight sa komunidad, ang Pasakja adunay Administrator role nga nagtugot sa transport operator o opisyal sa komunidad nga mag-verify sa mga driver, magbutang og fare zones ug rates, mag-monitor sa tanang booking, mag-manage sa SOS alerts, ug makita ang mga report sa platform. Kini nga administrative control dili ginahatag sa Grab, Joyride, o Angkas sa mga community operator. Dugang pa, ang Pasakja web-based, nga nagtugot sa pag-access bisan walay dedicated mobile application.

---

---

## QUESTION 7 — How secure is your system? What security measures did you implement?

**Why this will be asked:** Security is a fundamental concern for any system that handles user accounts, location data, and payments. Panelists will test whether the researchers implemented proper security practices or simply built the features without thinking about data protection.

---

**English Answer:**

We implemented several layers of security in Pasakja. First, all user passwords are hashed using bcryptjs with 12 salt rounds before being stored in the database — plain-text passwords are never saved. Second, we used NextAuth with a JWT session strategy, which means the server does not store active sessions in the database; instead, the session is verified from an encrypted token on each request. Third, all routes are protected by middleware that checks the user's authentication status and role before granting access — a passenger cannot access the driver or admin pages, and vice versa. Fourth, all form inputs and API data are validated using Zod schemas on both the client and server side, preventing malformed or malicious data from entering the database. Fifth, for payments, we used PayMongo's secured API with a test account to demonstrate the GCash checkout flow. We also acknowledged in our limitations that production use requires a verified merchant account, and we recommend a periodic security audit as a future step.

---

**Bisaya nga Tubag:**

Gi-implementar namo ang daghang layer sa seguridad sa Pasakja. Una, ang tanang password sa user gi-hash gamit ang bcryptjs nga adunay 12 salt rounds sa wala pa tipigan sa database — ang plain-text passwords dili gayud maluwas. Ikaduha, gigamit namo ang NextAuth nga adunay JWT session strategy, nga nagpasabut nga ang server dili magtipig og active sessions sa database; hinunoa, ang session gi-verify gikan sa encrypted token sa matag request. Ikatulo, ang tanang route giprotektahan sa middleware nga nagsusi sa authentication status ug role sa user sa wala pa ihatag ang access — ang pasahero dili makaadto sa mga pahina sa driver o admin, ug vice versa. Ikaupat, ang tanang form inputs ug API data gi-validate gamit ang Zod schemas sa client ug server side, nagpugong sa malformed o malisyosong datos nga mosulod sa database. Ikalima, alang sa mga bayad, gigamit namo ang secured API sa PayMongo nga adunay test account aron ipakita ang GCash checkout flow. Giila usab namo sa among mga limitasyon nga ang production use nagkinahanglan og verified merchant account, ug among girekomendar ang periodic security audit isip sunod nga lakang.

---

---

## QUESTION 8 — What are the limitations of your system, and how do you plan to address them?

**Why this will be asked:** No system is perfect, and panelists respect researchers who are honest and self-aware about what their system cannot do. This question also tests whether the researchers have thought critically about future development rather than just defending what was built.

---

**English Answer:**

Our study has several acknowledged limitations. First, the system is currently limited to the Socorro, Surigao del Norte community and has only been tested with a selected group of users. Second, it requires a stable internet connection and a GPS-enabled device to function properly. Third, we did not develop a native mobile application — the system is browser-based only. Fourth, the online payment feature uses a PayMongo test account, so real GCash transactions have not been processed; production use requires a verified merchant account. Fifth, the live map rendering showing real-time driver movement on-screen was not fully implemented and is identified as a future enhancement.

To address these, we recommend integrating a live map SDK like Leaflet.js or Google Maps for visual GPS tracking, connecting a production PayMongo merchant account, building a Progressive Web App or native mobile client, and conducting a broader pilot deployment with more evaluators from the community.

---

**Bisaya nga Tubag:**

Ang among pag-aaral adunay daghang giila nga limitasyon. Una, ang sistema limitado pa karon sa komunidad sa Socorro, Surigao del Norte ug gi-test lang sa piniling grupo sa mga user. Ikaduha, kinahanglan kini og stable nga internet connection ug GPS-enabled nga device aron magtrabaho. Ikatulo, wala kami magtukod og native mobile application — browser-based lang ang sistema. Ikaupat, ang online payment feature naggamit og PayMongo test account, busa wala pa maproseso ang tinuod nga GCash transactions; ang production use nagkinahanglan og verified merchant account. Ikalima, ang live map rendering nga nagpakita sa real-time nga paglihok sa driver sa screen dili pa bug-os na gi-implementar ug giila kini isip future enhancement.

Aron masulbad kini, among girekomendar ang pag-integrate og live map SDK sama sa Leaflet.js o Google Maps alang sa visual GPS tracking, pagkonektar sa production PayMongo merchant account, pagtukod og Progressive Web App o native mobile client, ug pagpahigayon og mas lapad nga pilot deployment nga adunay mas daghang evaluator gikan sa komunidad.

---

---

## QUESTION 9 — How does the driver verification process work, and why is it important?

**Why this will be asked:** Driver safety and accountability are central to any ride-hailing system. Panelists will ask this to test whether the researchers understand the purpose of verification and whether the workflow in the system is properly implemented and enforced.

---

**English Answer:**

In Pasakja, when a driver registers on the system, their account is given a PENDING status by default. A PENDING driver cannot toggle their availability or accept bookings — they are essentially blocked from operating until an administrator reviews and approves their registration. The administrator reviews the driver's submitted information, which includes their license number, vehicle type, plate number, and vehicle model. If the information is valid and the driver is cleared, the administrator clicks the Verify button on the Driver Management page, which changes the driver's status to VERIFIED. The driver can then set themselves as available and start receiving bookings. If a driver behaves improperly after verification, the administrator can Suspend the account, which blocks the driver from accepting new bookings again. This process is important because it ensures that only legitimate, identifiable drivers operate on the platform, which directly improves passenger safety and community trust in the system.

---

**Bisaya nga Tubag:**

Sa Pasakja, sa dihang mag-register ang driver sa sistema, ang ilang account makakuha og PENDING status by default. Ang PENDING nga driver dili makatoggle sa ilang availability o makatanggap og mga booking — gihapon silang gipugngan sa pagpadagan hangtud ma-review ug ma-aprubahan sa administrator ang ilang registration. Gi-review sa administrator ang gisubmit nga impormasyon sa driver, lakip ang license number, klase sa sakyanan, plake, ug modelo sa sakyanan. Kung ang impormasyon husto ug gi-clear ang driver, i-click sa administrator ang Verify button sa Driver Management page, nga magbag-o sa status sa driver ngadto sa VERIFIED. Makatoggle na dayon ang driver sa ilang availability ug magsugod og pagdawat og mga booking. Kung ang driver maghimo og dili tama human ma-verify, makapang-Suspend ang administrator sa account, nga magpugong pag-usab sa driver sa pagdawat og bag-ong booking. Importante kini nga proseso tungod kay kini nagsiguro nga ligitimo ug mailhan lang nga mga driver ang magpadagan sa platform, nga direktang nagpabuti sa kaligtasan sa pasahero ug pagsalig sa komunidad sa sistema.

---

---

## QUESTION 10 — How does the SOS emergency feature work, and what happens after an alert is sent?

**Why this will be asked:** The SOS feature is one of the safety highlights of the system mentioned repeatedly in the thesis. Panelists will want to know the full workflow — not just that a button exists, but what happens on both the passenger side and the administrator side when an alert is triggered.

---

**English Answer:**

When a passenger activates the SOS feature, they open the Emergency SOS page from their navigation menu. The system automatically captures their current GPS coordinates using the Browser Geolocation API. The passenger can optionally add a message describing their emergency. When they press the SOS button, the alert is immediately saved to the database as an SosAlert record containing the passenger's identity, GPS coordinates, timestamp, and message. On the administrator side, the SOS Alerts management page displays all submitted alerts. Unresolved alerts appear at the top with a red border, flagged as "Active Emergency." The administrator can then take action — contacting the passenger via their registered phone number, dispatching assistance, or coordinating with authorities. Once resolved, the administrator clicks "Mark as Resolved" to close the alert. We also designed the system so that even if GPS permission is denied by the device, the alert is still submitted using a fallback coordinate so the passenger is never left without help.

---

**Bisaya nga Tubag:**

Sa dihang i-activate sa pasahero ang SOS feature, ablihan nila ang Emergency SOS page gikan sa ilang navigation menu. Awtomatikong makuha sa sistema ang ilang kasamtangan nga GPS coordinates gamit ang Browser Geolocation API. Ang pasahero mahimong magdugang og optional nga mensahe nga naglalaragway sa ilang emergency. Sa dihang ipindot nila ang SOS button, ang alert dayon maluwas sa database isip SosAlert record nga adunay sulod ang identidad sa pasahero, GPS coordinates, timestamp, ug mensahe. Sa kilid sa administrator, ang SOS Alerts management page nagpakita sa tanang gisubmit nga mga alert. Ang mga unresolved nga alert makita sa ibabaw nga adunay pula nga border, gipakita isip "Active Emergency." Ang administrator makaaksyon dayon — makontact ang pasahero pinaagi sa ilang rehistradong numero sa telepono, mapadala og tabang, o makigtabang sa mga awtoridad. Sa dihang masulbad na, i-click sa administrator ang "Mark as Resolved" aron sirad-an ang alert. Gidisenyo usab namo ang sistema aron bisan kung gi-deny sa device ang GPS permission, ang alert ipadala pa gihapon gamit ang fallback coordinate aron ang pasahero dili mapabayaan nga walay tabang.

---

---

## QUESTION 11 — What database did you use, and why did you choose it?

**Why this will be asked:** Database choice is a technical decision that panelists expect the researchers to justify. They may also ask about the ORM, the schema design, or why a relational database was chosen over alternatives.

---

**English Answer:**

We used PostgreSQL as our database management system, hosted on Supabase, a cloud-based PostgreSQL platform. We chose PostgreSQL because it is a robust, open-source relational database that supports ACID transactions, foreign key constraints, and complex queries — all of which are important for our system where many tables are interconnected, such as Users, Bookings, Trips, Ratings, Earnings, Zones, and SosAlerts. We accessed the database through Prisma ORM, which gave us a type-safe query interface in TypeScript, meaning we could catch database errors at compile time rather than at runtime. Prisma also allowed us to manage schema changes through migrations, making it easy to update the database structure as the system evolved during development.

---

**Bisaya nga Tubag:**

Gigamit namo ang PostgreSQL isip among database management system, gihostingan sa Supabase, usa ka cloud-based PostgreSQL platform. Gipili namo ang PostgreSQL tungod kay kini usa ka lig-on, open-source nga relational database nga nagsuporta sa ACID transactions, foreign key constraints, ug komplikadong mga query — tanan importante alang sa among sistema diin daghang mga table ang nagkonektar sa usag usa, sama sa Users, Bookings, Trips, Ratings, Earnings, Zones, ug SosAlerts. Gi-access namo ang database pinaagi sa Prisma ORM, nga naghatag kanamo og type-safe query interface sa TypeScript, nga nagpasabut nga makuha namo ang mga database error sa compile time kaysa sa runtime. Ang Prisma nagtugot usab kanamo sa pag-manage sa mga pagbabag-o sa schema pinaagi sa migrations, nga nagpadali sa pag-update sa istruktura sa database samtang nagpadayon ang pag-develop sa sistema.

---

---

## QUESTION 12 — If you were to redo the system, what would you do differently?

**Why this will be asked:** This reflective question tests the maturity and critical thinking of the researchers. Panelists want to see that the team learned from the development process and can evaluate their own choices honestly. It also reveals whether they truly understand the trade-offs of their decisions.

---

**English Answer:**

If we were to redo the system, there are a few things we would do differently. First, we would integrate a live map SDK from the beginning — such as Leaflet.js combined with a real-time data layer — so that GPS tracking would show moving pins rather than just static coordinates. This would make the system feel closer to what passengers are used to from commercial apps. Second, we would apply for a PayMongo production merchant account earlier in the development process so that we could test real transactions and not be limited to a test environment. Third, we would invest more time in designing a more structured user testing phase with a larger and more diverse group of community evaluators to produce more statistically reliable ISO 9126 results. Finally, we would also look into building a Progressive Web App version from the start to give users a more app-like experience on their mobile devices.

---

**Bisaya nga Tubag:**

Kung among buhaton pag-usab ang sistema, adunay pipila ka butang nga lahi among buhaton. Una, mag-integrate na kami og live map SDK gikan sa sugod — sama sa Leaflet.js nga may real-time data layer — aron ang GPS tracking magpakita og naglihok nga mga pin kaysa sa mga static lang nga coordinates. Kini magtugon sa sistema nga mas suod sa ginhawa sa mga pasahero gikan sa mga komersyal nga app. Ikaduha, mag-apply kami og PayMongo production merchant account mas sayo pa sa proseso sa pag-develop aron makatest kami og tinuod nga mga transaksyon ug dili limitado sa test environment. Ikatulo, mag-invest kami og mas daghang panahon sa pagdisenyo og mas strukturado nga user testing phase nga adunay mas dako ug mas lainlain nga grupo sa community evaluator aron makahimo og mas estadistikanhong matinud-anon nga mga resulta sa ISO 9126. Sa katapusan, mag-tan-aw usab kami sa pagtukod og Progressive Web App version gikan sa sugod aron mahatagan ang mga user og mas app-like nga kasinatian sa ilang mga mobile device.

---

---

## QUESTION 13 — How did you handle the booking lifecycle — from request to completion?

**Why this will be asked:** The booking process is the heart of the entire system. Panelists will want to trace the exact workflow to verify that the researchers understand their own system's logic and that every step is properly implemented and recorded.

---

**English Answer:**

The booking lifecycle in Pasakja goes through five distinct statuses. It begins when a passenger submits a ride request, which creates a Booking record in the database with a status of PENDING. The booking is then visible to all available, verified drivers. When a driver accepts the booking, the status changes to ACCEPTED and the booking is now assigned to that specific driver. When the driver arrives and the passenger boards the vehicle, the driver updates the status to PICKED_UP. Once the trip is actively in progress, the driver changes it to IN_PROGRESS. Finally, when the destination is reached, the driver marks it as COMPLETED. At this point, an Earning record is automatically created for the driver. If the booking cannot proceed for any reason, either the passenger or the driver can CANCEL it. All status changes are timestamped and stored in the database, giving both the passenger and the administrator a complete traceable record of every trip.

---

**Bisaya nga Tubag:**

Ang booking lifecycle sa Pasakja adunay lima ka lahi nga mga status. Nagsugod kini sa dihang magsubmit ang pasahero og ride request, nga magtukod og Booking record sa database nga adunay status nga PENDING. Ang booking makita dayon sa tanang available ug verified nga driver. Sa dihang dawaton sa driver ang booking, ang status mabag-o ngadto sa ACCEPTED ug ang booking gi-assign na karon sa maong driver. Sa dihang moabot ang driver ug mosakay ang pasahero sa sakyanan, i-update sa driver ang status ngadto sa PICKED_UP. Sa dihang aktibo na ang byahe, baguhin kini sa driver ngadto sa IN_PROGRESS. Sa katapusan, sa dihang maabtan ang destinasyon, markahan sa driver kini isip COMPLETED. Sa punto kini, awtomatikong matukod ang Earning record alang sa driver. Kung dili mapadayon ang booking sa bisan unsang hinungdan, mahimong CANCEL kini sa pasahero o driver. Ang tanang pagbabag-o sa status gi-timestamp ug gitipig sa database, naghatag sa pasahero ug administrator og kumpletong traceable nga rekord sa matag biyahe.

---

---

## QUESTION 14 — What is the significance of your study to the community of Socorro, Surigao del Norte?

**Why this will be asked:** Panelists always ask about real-world impact and community relevance, especially for locally-focused capstone projects. This question tests whether the researchers have a genuine connection to the problem and can articulate tangible benefits beyond the technical features.

---

**English Answer:**

Pasakja directly addresses the transportation challenges of our community in Socorro, Surigao del Norte. For passengers, it eliminates the uncertainty of waiting for a ride by providing a structured booking system with real-time status updates and a transparent, pre-computed fare. This is especially valuable for residents who travel between barangays and need a reliable way to request transportation. For drivers, the system helps them find passengers more efficiently, track their earnings, and build a credible record of their service. For community transport operators and administrators, it provides the tools to manage and monitor transportation operations — something that previously relied entirely on informal arrangements. Beyond the technical benefits, Pasakja contributes to the broader goal of digitizing community services in underserved local areas, demonstrating that modern technology is not only for large cities but can also serve small communities like ours.

---

**Bisaya nga Tubag:**

Ang Pasakja direkta nga nasulbad ang mga hamon sa transportasyon sa among komunidad sa Socorro, Surigao del Norte. Alang sa mga pasahero, gikuha niini ang kawalay-kasigurohan sa paghulat og sakay pinaagi sa pagtukod og structured booking system nga adunay real-time status updates ug transparent, pre-computed nga pamasahe. Espesyal kining bililhon alang sa mga residente nga nagbiyahe tali sa mga barangay ug nagkinahanglan og kasaligan nga paagi sa pag-request og transportasyon. Alang sa mga driver, ang sistema nagtabang kanila nga mas episyente og pangita og pasahero, mamonitor ang ilang kita, ug magtukod og makredensyal nga rekord sa ilang serbisyo. Alang sa mga community transport operator ug administrator, kini naghatag og mga kasangkapan sa pag-manage ug pag-monitor sa mga operasyon sa transportasyon — usa ka butang nga kaniadto nag-depende lang sa informal nga mga kasabutan. Labaw pa sa mga teknikal nga benepisyo, ang Pasakja nagtubo sa mas lapad nga layunin sa pag-digitize sa mga serbisyo sa komunidad sa mga lugar nga kulang sa serbisyo, nagpakita nga ang modernong teknolohiya dili lang alang sa mga dakong lungsod kondili makasilbi usab sa gagmay nga komunidad sama sa amo.

---

---

## QUESTION 15 — What were the biggest challenges you encountered in developing this system, and how did you overcome them?

**Why this will be asked:** This question evaluates the researchers' problem-solving skills, honesty, and growth as developers. Panelists use it to assess whether the team truly built the system themselves and genuinely understands the difficulties involved.

---

**English Answer:**

We encountered several significant challenges during development. The first was integrating PayMongo for GCash payments. Understanding Payment Intents, handling redirect callbacks from the GCash checkout page, and updating payment status correctly required careful study of the PayMongo documentation and multiple rounds of testing with the test environment. The second challenge was implementing the booking lifecycle across three different user roles — each role sees and updates the booking from a different perspective, and keeping the status transitions accurate and consistent required careful database design and server-side validation. The third challenge was profile image management using Cloudinary — handling file uploads from the browser, sending them to the Cloudinary API, and saving the returned URL to the database in a single smooth flow was technically complex. We overcame these challenges by reading official documentation thoroughly, conducting incremental testing at each step, and breaking the problems into smaller parts until each worked correctly.

---

**Bisaya nga Tubag:**

Nakaatubang kami og daghang malalim nga hamon sa panahon sa pag-develop. Ang una mao ang pag-integrate sa PayMongo alang sa GCash payments. Ang pag-alam sa Payment Intents, paghikap sa redirect callbacks gikan sa GCash checkout page, ug hustong pag-update sa payment status nagkinahanglan og maingong pagtuon sa PayMongo documentation ug daghang round sa testing gamit ang test environment. Ang ikaduhang hamon mao ang pag-implementar sa booking lifecycle sa tulo ka lainlain nga user roles — ang matag role nagtindog ug nag-update sa booking gikan sa lainlain nga perspektibo, ug ang pagpadayon sa katumpakan ug konsistensya sa mga status transition nagkinahanglan og maingon nga disenyo sa database ug server-side validation. Ang ikatulo nga hamon mao ang pag-manage sa profile image gamit ang Cloudinary — ang paghikap sa file uploads gikan sa browser, pagpadala niini sa Cloudinary API, ug pagluwas sa gibalik nga URL sa database sa usa ka maanindot nga proseso teknikal nga komplikado. Gisulbad namo kini nga mga hamon pinaagi sa maingon nga pagbasa sa opisyal nga dokumentasyon, pagpahigayon og incremental testing sa matag lakang, ug pagbahin sa mga problema ngadto sa gagmay nga mga bahin hangtud ang matag usa nagtrabaho nga husto.

---

---

*End of Defense Q&A Guide — PASAKJA Capstone Thesis*

*Prepared for: Judy-Ann P. Puno, Daphnie Dane V. Supero, Leerose T. Guma*  
*Bucas Grande Foundation College — College of Information Technology, 2025*
