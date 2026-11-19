// Shared shell for every page: icons, title bar, activity bar, sidebar, footer, search, tooltips, developer card.
const SPRITE = `
<symbol id="i-folder-open" viewBox="0 0 256 256"><path d="M245,110.64A16,16,0,0,0,232,104H216V88a16,16,0,0,0-16-16H130.67L102.94,51.2a16.14,16.14,0,0,0-9.6-3.2H40A16,16,0,0,0,24,64V208h0a8,8,0,0,0,8,8H211.1a8,8,0,0,0,7.59-5.47l28.49-85.47A16.05,16.05,0,0,0,245,110.64ZM93.34,64,123.2,86.4A8,8,0,0,0,128,88h72v16H69.77a16,16,0,0,0-15.18,10.94L40,158.7V64Zm112,136H43.1l26.67-80H232Z"/></symbol>
<symbol id="i-magnifying-glass" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></symbol>
<symbol id="i-calculator" viewBox="0 0 256 256"><path d="M80,120h96a8,8,0,0,0,8-8V64a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v48A8,8,0,0,0,80,120Zm8-48h80v32H88ZM200,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24Zm0,192H56V40H200ZM100,148a12,12,0,1,1-12-12A12,12,0,0,1,100,148Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,140,148Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,180,148Zm-80,40a12,12,0,1,1-12-12A12,12,0,0,1,100,188Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,140,188Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,180,188Z"/></symbol>
<symbol id="i-atom" viewBox="0 0 256 256"><path d="M196.12,128c24.65-34.61,37.22-70.38,19.74-87.86S162.61,35.23,128,59.88C93.39,35.23,57.62,22.66,40.14,40.14S35.23,93.39,59.88,128c-24.65,34.61-37.22,70.38-19.74,87.86h0c5.63,5.63,13.15,8.14,21.91,8.14,18.48,0,42.48-11.17,66-27.88C151.47,212.83,175.47,224,194,224c8.76,0,16.29-2.52,21.91-8.14h0C233.34,198.38,220.77,162.61,196.12,128Zm8.43-76.55c7.64,7.64,2.48,32.4-18.52,63.28a300.33,300.33,0,0,0-21.19-23.57A300.33,300.33,0,0,0,141.27,70C172.15,49,196.91,43.8,204.55,51.45ZM176.29,128a289.14,289.14,0,0,1-22.76,25.53A289.14,289.14,0,0,1,128,176.29a289.14,289.14,0,0,1-25.53-22.76A289.14,289.14,0,0,1,79.71,128,298.62,298.62,0,0,1,128,79.71a289.14,289.14,0,0,1,25.53,22.76A289.14,289.14,0,0,1,176.29,128ZM51.45,51.45c2.2-2.21,5.83-3.35,10.62-3.35C73.89,48.1,92.76,55,114.72,70A304,304,0,0,0,91.16,91.16,300.33,300.33,0,0,0,70,114.73C49,83.85,43.81,59.09,51.45,51.45Zm0,153.1C43.81,196.91,49,172.15,70,141.27a300.33,300.33,0,0,0,21.19,23.57A304.18,304.18,0,0,0,114.73,186C83.85,207,59.09,212.2,51.45,204.55Zm153.1,0c-7.64,7.65-32.4,2.48-63.28-18.52a304.18,304.18,0,0,0,23.57-21.19A300.33,300.33,0,0,0,186,141.27C207,172.15,212.19,196.91,204.55,204.55ZM140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Z"/></symbol>
<symbol id="i-file-text" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"/></symbol>
<symbol id="i-caret-right" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/></symbol>
<symbol id="i-caret-down" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></symbol>
<symbol id="i-caret-left" viewBox="0 0 256 256"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/></symbol>
<symbol id="i-book-open" viewBox="0 0 256 256"><path d="M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"/></symbol>
<symbol id="i-lightbulb" viewBox="0 0 256 256"><path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z"/></symbol>
<symbol id="i-sparkle" viewBox="0 0 256 256"><path d="M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"/></symbol>
<symbol id="i-list-checks" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128ZM128,72h88a8,8,0,0,0,0-16H128a8,8,0,0,0,0,16Zm88,112H128a8,8,0,0,0,0,16h88a8,8,0,0,0,0-16ZM82.34,42.34,56,68.69,45.66,58.34A8,8,0,0,0,34.34,69.66l16,16a8,8,0,0,0,11.32,0l32-32A8,8,0,0,0,82.34,42.34Zm0,64L56,132.69,45.66,122.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Zm0,64L56,196.69,45.66,186.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Z"/></symbol>
<symbol id="i-house" viewBox="0 0 256 256"><path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z"/></symbol>
<symbol id="i-info" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/></symbol>
<symbol id="i-wrench" viewBox="0 0 256 256"><path d="M226.76,69a8,8,0,0,0-12.84-2.88l-40.3,37.19-17.23-3.7-3.7-17.23,37.19-40.3A8,8,0,0,0,187,29.24,72,72,0,0,0,88,96,72.34,72.34,0,0,0,94,124.94L33.79,177c-.15.12-.29.26-.43.39a32,32,0,0,0,45.26,45.26c.13-.13.27-.28.39-.42L131.06,162A72,72,0,0,0,232,96,71.56,71.56,0,0,0,226.76,69ZM160,152a56.14,56.14,0,0,1-27.07-7,8,8,0,0,0-9.92,1.77L67.11,211.51a16,16,0,0,1-22.62-22.62L109.18,133a8,8,0,0,0,1.77-9.93,56,56,0,0,1,58.36-82.31l-31.2,33.81a8,8,0,0,0-1.94,7.1L141.83,108a8,8,0,0,0,6.14,6.14l26.35,5.66a8,8,0,0,0,7.1-1.94l33.81-31.2A56.06,56.06,0,0,1,160,152Z"/></symbol>
<symbol id="i-chart-line-up" viewBox="0 0 256 256"><path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z"/></symbol>
<symbol id="i-clock" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/></symbol>
<symbol id="i-envelope-simple" viewBox="0 0 256 256"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"/></symbol>
<symbol id="i-github-logo" viewBox="0 0 256 256"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"/></symbol>
<symbol id="i-code" viewBox="0 0 256 256"><path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"/></symbol>
<symbol id="i-cpu" viewBox="0 0 256 256"><path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Zm88,0H216V112h16a8,8,0,0,0,0-16H216V56a16,16,0,0,0-16-16H160V24a8,8,0,0,0-16,0V40H112V24a8,8,0,0,0-16,0V40H56A16,16,0,0,0,40,56V96H24a8,8,0,0,0,0,16H40v32H24a8,8,0,0,0,0,16H40v40a16,16,0,0,0,16,16H96v16a8,8,0,0,0,16,0V216h32v16a8,8,0,0,0,16,0V216h40a16,16,0,0,0,16-16V160h16a8,8,0,0,0,0-16Zm-32,56H56V56H200v95.87s0,.09,0,.13,0,.09,0,.13V200Z"/></symbol>
<symbol id="i-robot" viewBox="0 0 256 256"><path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-24,16v24H116V152ZM80,164a12,12,0,0,1,12-12h8v24H92A12,12,0,0,1,80,164Zm84,12h-8V152h8a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z"/></symbol>
<symbol id="i-brain" viewBox="0 0 256 256"><path d="M248,124a56.11,56.11,0,0,0-32-50.61V72a48,48,0,0,0-88-26.49A48,48,0,0,0,40,72v1.39a56,56,0,0,0,0,101.2V176a48,48,0,0,0,88,26.49A48,48,0,0,0,216,176v-1.41A56.09,56.09,0,0,0,248,124ZM88,208a32,32,0,0,1-31.81-28.56A55.87,55.87,0,0,0,64,180h8a8,8,0,0,0,0-16H64A40,40,0,0,1,50.67,86.27,8,8,0,0,0,56,78.73V72a32,32,0,0,1,64,0v68.26A47.8,47.8,0,0,0,88,128a8,8,0,0,0,0,16,32,32,0,0,1,0,64Zm104-44h-8a8,8,0,0,0,0,16h8a55.87,55.87,0,0,0,7.81-.56A32,32,0,1,1,168,144a8,8,0,0,0,0-16,47.8,47.8,0,0,0-32,12.26V72a32,32,0,0,1,64,0v6.73a8,8,0,0,0,5.33,7.54A40,40,0,0,1,192,164Zm16-52a8,8,0,0,1-8,8h-4a36,36,0,0,1-36-36V80a8,8,0,0,1,16,0v4a20,20,0,0,0,20,20h4A8,8,0,0,1,208,112ZM60,120H56a8,8,0,0,1,0-16h4A20,20,0,0,0,80,84V80a8,8,0,0,1,16,0v4A36,36,0,0,1,60,120Z"/></symbol>
<symbol id="i-circuitry" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM88,160a8,8,0,1,1-8,8A8,8,0,0,1,88,160ZM48,48H80v97.38a24,24,0,1,0,16,0V115.31l48,48V208H48ZM208,208H160V160a8,8,0,0,0-2.34-5.66L96,92.69V48h32V72a8,8,0,0,0,2.34,5.66l16,16A23.74,23.74,0,0,0,144,104a24,24,0,1,0,24-24,23.74,23.74,0,0,0-10.34,2.35L144,68.69V48h64V208ZM168,96a8,8,0,1,1-8,8A8,8,0,0,1,168,96Z"/></symbol>
<symbol id="i-chat-text" viewBox="0 0 256 256"><path d="M216,48H40A16,16,0,0,0,24,64V224a15.85,15.85,0,0,0,9.24,14.5A16.13,16.13,0,0,0,40,240a15.89,15.89,0,0,0,10.25-3.78l.09-.07L83,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM40,224h0ZM216,192H80a8,8,0,0,0-5.23,1.95L40,224V64H216ZM88,112a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,112Zm0,32a8,8,0,0,1,8-8h64a8,8,0,1,1,0,16H96A8,8,0,0,1,88,144Z"/></symbol>
<symbol id="i-eye" viewBox="0 0 256 256"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/></symbol>
<symbol id="i-terminal-window" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-3,6.25l-40,32a8,8,0,1,1-10-12.5L107.19,128,75,102.25a8,8,0,1,1,10-12.5l40,32A8,8,0,0,1,128,128Zm48,24H136a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm56-96V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Z"/></symbol>
<symbol id="i-list" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/></symbol>
<symbol id="i-path" viewBox="0 0 256 256"><path d="M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z"/></symbol>
<symbol id="i-warning" viewBox="0 0 256 256"><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"/></symbol>
<symbol id="i-check-circle" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></symbol>
<symbol id="i-notebook" viewBox="0 0 256 256"><path d="M184,112a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h64A8,8,0,0,1,184,112Zm-8,24H112a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm48-88V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H72V48H48Zm160,0V48H88V208H208Z"/></symbol>
<symbol id="i-translate" viewBox="0 0 256 256"><path d="M247.15,212.42l-56-112a8,8,0,0,0-14.31,0l-21.71,43.43A88,88,0,0,1,108,126.93,103.65,103.65,0,0,0,135.69,64H160a8,8,0,0,0,0-16H104V32a8,8,0,0,0-16,0V48H32a8,8,0,0,0,0,16h87.63A87.76,87.76,0,0,1,96,116.35a87.74,87.74,0,0,1-19-31,8,8,0,1,0-15.08,5.34A103.63,103.63,0,0,0,84,127a87.55,87.55,0,0,1-52,17,8,8,0,0,0,0,16,103.46,103.46,0,0,0,64-22.08,104.18,104.18,0,0,0,51.44,21.31l-26.6,53.19a8,8,0,0,0,14.31,7.16L148.94,192h70.11l13.79,27.58A8,8,0,0,0,240,224a8,8,0,0,0,7.15-11.58ZM156.94,176,184,121.89,211.05,176Z"/></symbol>
<symbol id="i-camera" viewBox="0 0 256 256"><path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"/></symbol>
<symbol id="i-exam" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.16L64,208.94l28.42,14.22a8,8,0,0,0,7.16,0L128,208.94l28.42,14.22a8,8,0,0,0,7.16,0L192,208.94l28.42,14.22A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM60.42,167.16a8,8,0,0,0,10.74-3.58L76.94,152h38.12l5.78,11.58a8,8,0,1,0,14.32-7.16l-32-64a8,8,0,0,0-14.32,0l-32,64A8,8,0,0,0,60.42,167.16ZM96,113.89,107.06,136H84.94ZM136,128a8,8,0,0,1,8-8h16V104a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H176v16a8,8,0,0,1-16,0V136H144A8,8,0,0,1,136,128Z"/></symbol>
<symbol id="i-map-trifold" viewBox="0 0 256 256"><path d="M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8.15,8.15,0,0,0,160,224a8,8,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69ZM104,52.94l48,24V203.06l-48-24ZM40,62.25l48-12v127.5l-48,12Zm176,131.5-48,12V78.25l48-12Z"/></symbol>
<symbol id="i-rocket-launch" viewBox="0 0 256 256"><path d="M223.85,47.12a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.41,27.07L132.69,64H74.36A15.91,15.91,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A15.91,15.91,0,0,0,192,181.64V123.31l4.77-4.77C223.45,91.86,224.6,59.71,223.85,47.12ZM74.36,80h42.33L77.16,119.52,40,114.34Zm74.41-9.45a76.65,76.65,0,0,1,59.11-22.47,76.46,76.46,0,0,1-22.42,59.16L128,164.68,91.32,128ZM176,181.64,141.67,216l-5.19-37.17L176,139.31Zm-74.16,9.5C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Z"/></symbol>
<symbol id="i-signpost" viewBox="0 0 256 256"><path d="M246,106.65,212.33,69.3A16,16,0,0,0,200.44,64H136V32a8,8,0,0,0-16,0V64H40A16,16,0,0,0,24,80v64a16,16,0,0,0,16,16h80v64a8,8,0,0,0,16,0V160h64.44a16,16,0,0,0,11.89-5.3L246,117.35A8,8,0,0,0,246,106.65ZM200.44,144H40V80H200.44l28.8,32Z"/></symbol>
<symbol id="i-books" viewBox="0 0 256 256"><path d="M231.65,194.55,198.46,36.75a16,16,0,0,0-19-12.39L132.65,34.42a16.08,16.08,0,0,0-12.3,19l33.19,157.8A16,16,0,0,0,169.16,224a16.25,16.25,0,0,0,3.38-.36l46.81-10.06A16.09,16.09,0,0,0,231.65,194.55ZM136,50.15c0-.06,0-.09,0-.09l46.8-10,3.33,15.87L139.33,66Zm6.62,31.47,46.82-10.05,3.34,15.9L146,97.53Zm6.64,31.57,46.82-10.06,13.3,63.24-46.82,10.06ZM216,197.94l-46.8,10-3.33-15.87L212.67,182,216,197.85C216,197.91,216,197.94,216,197.94ZM104,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,104,32ZM56,48h48V64H56Zm0,32h48v96H56Zm48,128H56V192h48v16Z"/></symbol>
<symbol id="i-hard-drives" viewBox="0 0 256 256"><path d="M208,136H48a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V152A16,16,0,0,0,208,136Zm0,64H48V152H208v48Zm0-160H48A16,16,0,0,0,32,56v48a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,64H48V56H208v48ZM192,80a12,12,0,1,1-12-12A12,12,0,0,1,192,80Zm0,96a12,12,0,1,1-12-12A12,12,0,0,1,192,176Z"/></symbol>
<symbol id="i-graduation-cap" viewBox="0 0 256 256"><path d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L176,143.47v46.34C163.4,195.69,147.52,200,128,200Zm80-33.75a97.83,97.83,0,0,1-16,14.25V134.93l16-8.53ZM188,118.94l-.22-.13-56-29.87a8,8,0,0,0-7.52,14.12L171,128l-43,22.93L25,96,128,41.07,231,96Z"/></symbol>
<symbol id="i-cube" viewBox="0 0 256 256"><path d="M223.68,66.15,135.68,18h0a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32h0l80.34,44L128,120,47.66,76ZM40,90l80,43.78v85.79L40,175.82Zm96,129.57V133.82L216,90v85.78Z"/></symbol>
<symbol id="i-user-circle" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z"/></symbol>
<symbol id="i-arrow-up-right" viewBox="0 0 256 256"><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/></symbol>
<symbol id="i-buildings" viewBox="0 0 256 256"><path d="M240,208H224V96a16,16,0,0,0-16-16H144V32a16,16,0,0,0-24.88-13.32L39.12,72A16,16,0,0,0,32,85.34V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H144V96ZM48,85.34,128,32V208H48ZM112,112v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm-32,0v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm0,56v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm32,0v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Z"/></symbol>
<symbol id="i-lightning" viewBox="0 0 256 256"><path d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17ZM109.37,214l10.47-52.38a8,8,0,0,0-5-9.06L62,132.71l84.62-90.66L136.16,94.43a8,8,0,0,0,5,9.06l52.8,19.8Z"/></symbol>
<symbol id="i-flask" viewBox="0 0 256 256"><path d="M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z"/></symbol>
<symbol id="i-heart" viewBox="0 0 256 256"><path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z"/></symbol>
<symbol id="i-gear-six" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm109.94-52.79a8,8,0,0,0-3.89-5.4l-29.83-17-.12-33.62a8,8,0,0,0-2.83-6.08,111.91,111.91,0,0,0-36.72-20.67,8,8,0,0,0-6.46.59L128,41.85,97.88,25a8,8,0,0,0-6.47-.6A112.1,112.1,0,0,0,54.73,45.15a8,8,0,0,0-2.83,6.07l-.15,33.65-29.83,17a8,8,0,0,0-3.89,5.4,106.47,106.47,0,0,0,0,41.56,8,8,0,0,0,3.89,5.4l29.83,17,.12,33.62a8,8,0,0,0,2.83,6.08,111.91,111.91,0,0,0,36.72,20.67,8,8,0,0,0,6.46-.59L128,214.15,158.12,231a7.91,7.91,0,0,0,3.9,1,8.09,8.09,0,0,0,2.57-.42,112.1,112.1,0,0,0,36.68-20.73,8,8,0,0,0,2.83-6.07l.15-33.65,29.83-17a8,8,0,0,0,3.89-5.4A106.47,106.47,0,0,0,237.94,107.21Zm-15,34.91-28.57,16.25a8,8,0,0,0-3,3c-.58,1-1.19,2.06-1.81,3.06a7.94,7.94,0,0,0-1.22,4.21l-.15,32.25a95.89,95.89,0,0,1-25.37,14.3L134,199.13a8,8,0,0,0-3.91-1h-.19c-1.21,0-2.43,0-3.64,0a8.08,8.08,0,0,0-4.1,1l-28.84,16.1A96,96,0,0,1,67.88,201l-.11-32.2a8,8,0,0,0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.09,8.09,0,0,0-3-3.06l-28.6-16.29a90.49,90.49,0,0,1,0-28.26L61.67,97.63a8,8,0,0,0,3-3c.58-1,1.19-2.06,1.81-3.06a7.94,7.94,0,0,0,1.22-4.21l.15-32.25a95.89,95.89,0,0,1,25.37-14.3L122,56.87a8,8,0,0,0,4.1,1c1.21,0,2.43,0,3.64,0a8.08,8.08,0,0,0,4.1-1l28.84-16.1A96,96,0,0,1,188.12,55l.11,32.2a8,8,0,0,0,1.22,4.22c.62,1,1.23,2,1.8,3.06a8.09,8.09,0,0,0,3,3.06l28.6,16.29A90.49,90.49,0,0,1,222.9,142.12Z"/></symbol>
<symbol id="i-ruler" viewBox="0 0 256 256"><path d="M235.32,73.37,182.63,20.69a16,16,0,0,0-22.63,0L20.68,160a16,16,0,0,0,0,22.63l52.69,52.68a16,16,0,0,0,22.63,0L235.32,96A16,16,0,0,0,235.32,73.37ZM84.68,224,32,171.31l32-32,26.34,26.35a8,8,0,0,0,11.32-11.32L75.31,128,96,107.31l26.34,26.35a8,8,0,0,0,11.32-11.32L107.31,96,128,75.31l26.34,26.35a8,8,0,0,0,11.32-11.32L139.31,64l32-32L224,84.69Z"/></symbol>
<symbol id="i-desktop" viewBox="0 0 256 256"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24h72v16H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V200h72a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40ZM48,56H208a8,8,0,0,1,8,8v80H40V64A8,8,0,0,1,48,56ZM208,184H48a8,8,0,0,1-8-8V160H216v16A8,8,0,0,1,208,184Z"/></symbol>
<symbol id="i-globe" viewBox="0 0 256 256"><path d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a115.11,115.11,0,0,1,26-45A115.27,115.27,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z"/></symbol>
<symbol id="i-puzzle-piece" viewBox="0 0 256 256"><path d="M220.27,158.54a8,8,0,0,0-7.7-.46,20,20,0,1,1,0-36.16A8,8,0,0,0,224,114.69V72a16,16,0,0,0-16-16H171.78a35.36,35.36,0,0,0,.22-4,36.11,36.11,0,0,0-11.36-26.24,36,36,0,0,0-60.55,23.62,36.56,36.56,0,0,0,.14,6.62H64A16,16,0,0,0,48,72v32.22a35.36,35.36,0,0,0-4-.22,36.12,36.12,0,0,0-26.24,11.36,35.7,35.7,0,0,0-9.69,27,36.08,36.08,0,0,0,33.31,33.6,35.68,35.68,0,0,0,6.62-.14V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V165.31A8,8,0,0,0,220.27,158.54ZM208,208H64V165.31a8,8,0,0,0-11.43-7.23,20,20,0,1,1,0-36.16A8,8,0,0,0,64,114.69V72h46.69a8,8,0,0,0,7.23-11.43,20,20,0,1,1,36.16,0A8,8,0,0,0,161.31,72H208v32.23a35.68,35.68,0,0,0-6.62-.14A36,36,0,0,0,204,176a35.36,35.36,0,0,0,4-.22Z"/></symbol>
<symbol id="i-toolbox" viewBox="0 0 256 256"><path d="M224,64H176V56a24,24,0,0,0-24-24H104A24,24,0,0,0,80,56v8H32A16,16,0,0,0,16,80V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64ZM96,56a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM224,80v32H192v-8a8,8,0,0,0-16,0v8H80v-8a8,8,0,0,0-16,0v8H32V80Zm0,112H32V128H64v8a8,8,0,0,0,16,0v-8h96v8a8,8,0,0,0,16,0v-8h32v64Z"/></symbol>
<symbol id="i-text-aa" viewBox="0 0 256 256"><path d="M87.24,52.59a8,8,0,0,0-14.48,0l-64,136a8,8,0,1,0,14.48,6.81L39.9,160h80.2l16.66,35.4a8,8,0,1,0,14.48-6.81ZM47.43,144,80,74.79,112.57,144ZM200,96c-12.76,0-22.73,3.47-29.63,10.32a8,8,0,0,0,11.26,11.36c3.8-3.77,10-5.68,18.37-5.68,13.23,0,24,9,24,20v3.22A42.76,42.76,0,0,0,200,128c-22.06,0-40,16.15-40,36s17.94,36,40,36a42.73,42.73,0,0,0,24-7.25,8,8,0,0,0,16-.75V132C240,112.15,222.06,96,200,96Zm0,88c-13.23,0-24-9-24-20s10.77-20,24-20,24,9,24,20S213.23,184,200,184Z"/></symbol>
`;
const HEADER = `
  <header class="top">
    <a class="logo" href="index.html" aria-label="Coder home"><svg class="i"><use href="#i-code"/></svg></a>
    <nav class="menu" aria-label="Main">
      <a href="index.html">Home</a>
      <a href="notes.html">Notes</a>
      <a href="work.html">Work</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tools.html">Tools</a>
      <a href="about.html">About</a>
      <a href="about.html#changelog">Changelog</a>
    </nav>
    <div class="nav">
      <button class="ib" type="button" onclick="history.back()" aria-label="Back" title="Back"><svg class="i"><use href="#i-caret-left"/></svg></button>
      <button class="ib" type="button" onclick="history.forward()" aria-label="Forward" title="Forward"><svg class="i"><use href="#i-caret-right"/></svg></button>
    </div>
    <div class="cmd">
      <svg class="i"><use href="#i-magnifying-glass"/></svg>
      <input id="cmd" type="search" placeholder="Coder" aria-label="Go to a chapter or page (Ctrl+P)" autocomplete="off">
      <ul id="cmd-list" hidden></ul>
    </div>
    <div class="right">
      <button class="ib" type="button" id="toggle" aria-label="Toggle sidebar (Ctrl+B)" title="Toggle sidebar (Ctrl+B)"><svg class="i"><use href="#i-list"/></svg></button>
    </div>
  </header>
`;
const ACT_REST = `
    <a href="notes.html" title="Notes" aria-label="Notes"><svg class="i"><use href="#i-notebook"/></svg></a>
    <a href="work.html" title="Work" aria-label="Work"><svg class="i"><use href="#i-toolbox"/></svg></a>
    <a href="roadmap.html" title="Roadmap" aria-label="Roadmap"><svg class="i"><use href="#i-map-trifold"/></svg></a>
    <a href="tools.html" title="Tools" aria-label="Tools"><svg class="i"><use href="#i-wrench"/></svg></a>
    <span class="gap"></span>
    <a href="major.html" title="About the major" aria-label="About the major"><svg class="i"><use href="#i-graduation-cap"/></svg></a>
    <a href="projects.html" title="Projects" aria-label="Projects"><svg class="i"><use href="#i-cube"/></svg></a>
    <a href="materials.html" title="Materials" aria-label="Materials"><svg class="i"><use href="#i-books"/></svg></a>
    <span class="div" role="separator"></span>
    <button id="gear" title="Settings" aria-label="Settings"><svg class="i"><use href="#i-gear-six"/></svg></button>
    <a href="about.html" title="About Coder" aria-label="About Coder"><svg class="i"><use href="#i-info"/></svg></a>
  
`;
const FOOTER = `
  <footer class="status">
    <a class="bub brand" href="index.html" aria-label="Coder home" title="Coder"><svg class="i"><use href="#i-code"/></svg></a>
    <span class="hide" title="Branch"><svg class="i"><use href="#i-path"/></svg>main</span>
    <span class="hide" title="Problems"><svg class="i"><use href="#i-warning"/></svg>0</span>
    <span id="count" title="Chapters"><svg class="i"><use href="#i-notebook"/></svg></span>
    <a href="notes.html" id="done" title="Chapters done"><svg class="i"><use href="#i-check-circle"/></svg></a>
    <span class="gap"></span>
    <span class="hide" title="Language"><svg class="i"><use href="#i-translate"/></svg>EN</span>
    <span class="sep hide"></span>
    <a class="hide" href="major.html" title="About the major"><svg class="i"><use href="#i-graduation-cap"/></svg>Major</a>
    <a class="hide" href="projects.html"><svg class="i"><use href="#i-cube"/></svg>Projects</a>
    <a class="hide" href="materials.html"><svg class="i"><use href="#i-books"/></svg>Materials</a>
    <span class="sep hide"></span>
    <a class="hide" href="about.html" title="About Coder"><svg class="i"><use href="#i-info"/></svg>About</a>
    <a class="hide" href="about.html#changelog"><svg class="i"><use href="#i-clock"/></svg>Changelog</a>
    <span class="sep hide"></span>
    <button class="dev" id="dev" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="dev-pop"><svg class="i"><use href="#i-user-circle"/></svg><span class="t">Developer</span></button>
    <a class="bub" href="mailto:raphee.rattanamanoonporn@gmail.com" aria-label="Email the site developer" title="Email the site developer"><svg class="i"><use href="#i-envelope-simple"/></svg></a>
    <a class="bub" href="https://github.com/Ray0737" target="_blank" rel="noopener" aria-label="Site developer on GitHub" title="Site developer on GitHub"><svg class="i"><use href="#i-github-logo"/></svg></a>
    <span>© 2026 Coder</span>
  </footer>

  <div class="pop" id="dev-pop" role="dialog" aria-label="Developer" hidden>
    <div class="who"><svg class="i"><use href="#i-user-circle"/></svg><div><b>Mr. Raphee Rattanamanoonporn</b><span>Site developer</span></div></div>
    <a href="https://github.com/Ray0737" target="_blank" rel="noopener"><svg class="i"><use href="#i-github-logo"/></svg>GitHub<span class="dim">Ray0737</span><svg class="i go"><use href="#i-arrow-up-right"/></svg></a>
    <a href="mailto:raphee.rattanamanoonporn@gmail.com"><svg class="i"><use href="#i-envelope-simple"/></svg>Email<span class="dim">raphee.rattanamanoonporn@gmail.com</span><svg class="i go"><use href="#i-arrow-up-right"/></svg></a>
    <a href="https://github.com/eai-spsm" target="_blank" rel="noopener"><svg class="i"><use href="#i-buildings"/></svg>Major GitHub<span class="dim">eai-spsm</span><svg class="i go"><use href="#i-arrow-up-right"/></svg></a>
  </div>
`;
const SETTINGS = `
<div class="welcome wide">
<h1>Settings</h1>
<p class="lead">Theme, language, sizing and a few other options</p>
<p class="note wide">These are view-only for now. Changing them will work in a later version.</p>

<h2 class="ph">Theme</h2>
<div class="setlist"><div class="set"><span class="si"><svg class="i"><use href="#i-eye"/></svg></span><div class="st"><b>Colour theme</b><p>The four Catppuccin flavours. Mocha is the one in use.</p></div>
<div class="seg" aria-disabled="true"><button class="on" disabled>Mocha</button><button disabled>Macchiato</button><button disabled>Frappé</button><button disabled>Latte</button></div></div></div>
<div class="flavours" aria-hidden="true">
<div class="flv on" style="--b:#1e1e2e;--t:#cdd6f4"><svg class="i ck"><use href="#i-check-circle"/></svg><span class="aa">Aa</span><span class="dots"><i style="background:#cba6f7"></i><i style="background:#89b4fa"></i><i style="background:#a6e3a1"></i></span><span class="nm">Mocha<span>In use</span></span></div>
<div class="flv" style="--b:#24273a;--t:#cad3f5"><span class="aa">Aa</span><span class="dots"><i style="background:#c6a0f6"></i><i style="background:#8aadf4"></i><i style="background:#a6da95"></i></span><span class="nm">Macchiato<span>Soon</span></span></div>
<div class="flv" style="--b:#303446;--t:#c6d0f5"><span class="aa">Aa</span><span class="dots"><i style="background:#ca9ee6"></i><i style="background:#8caaee"></i><i style="background:#a6d189"></i></span><span class="nm">Frappé<span>Soon</span></span></div>
<div class="flv" style="--b:#eff1f5;--t:#4c4f69"><span class="aa">Aa</span><span class="dots"><i style="background:#8839ef"></i><i style="background:#1e66f5"></i><i style="background:#40a02b"></i></span><span class="nm">Latte<span>Soon</span></span></div>
</div>

<h2 class="ph sec">Language</h2>
<div class="setlist"><div class="set"><span class="si"><svg class="i"><use href="#i-globe"/></svg></span><div class="st"><b>Language</b><p>English is the only language so far. Thai comes with the chapter pages.</p></div>
<div class="seg" aria-disabled="true"><button class="on" disabled>EN</button><button disabled>TH</button></div></div></div>

<h2 class="ph sec">Sizing</h2>
<div class="setlist">
<div class="set"><span class="si"><svg class="i"><use href="#i-text-aa"/></svg></span><div class="st"><b>Text size</b><p>Small is 12px, the size used everywhere today.</p></div><div class="seg" aria-disabled="true"><button class="on" disabled>Small</button><button disabled>Medium</button><button disabled>Large</button></div></div>
<div class="set"><span class="si"><svg class="i"><use href="#i-ruler"/></svg></span><div class="st"><b>Spacing</b><p>How much room sits between rows and cards.</p></div><div class="seg" aria-disabled="true"><button class="on" disabled>Compact</button><button disabled>Comfortable</button></div></div>
<div class="set"><span class="si"><svg class="i"><use href="#i-desktop"/></svg></span><div class="st"><b>Sidebar width</b><p>The width of the panel next to the left bar.</p></div><div class="seg" aria-disabled="true"><button class="on" disabled>Default</button><button disabled>Wide</button></div></div>
</div>

<h2 class="ph sec">Other</h2>
<div class="setlist">
<div class="set"><span class="si"><svg class="i"><use href="#i-lightning"/></svg></span><div class="st"><b>Animations</b><p>The small movements in the drawings. Turns off by itself if your system asks for less motion.</p></div><span class="tog on" role="switch" aria-checked="true" aria-disabled="true"></span></div>
<div class="set"><span class="si"><svg class="i"><use href="#i-chat-text"/></svg></span><div class="st"><b>Tooltips</b><p>The small label that shows when you hold the pointer on an icon.</p></div><span class="tog on" role="switch" aria-checked="true" aria-disabled="true"></span></div>
<div class="set"><span class="si"><svg class="i"><use href="#i-folder-open"/></svg></span><div class="st"><b>Open the sidebar on start</b><p>Show the panel next to the left bar when a page opens.</p></div><span class="tog on" role="switch" aria-checked="true" aria-disabled="true"></span></div>
<div class="set"><span class="si"><svg class="i"><use href="#i-house"/></svg></span><div class="st"><b>Keep the Welcome tab</b><p>Leave the Welcome tab open beside the page you are on.</p></div><span class="tog on" role="switch" aria-checked="true" aria-disabled="true"></span></div>
</div>
</div>
`;
// ponytail: chapter list lives here until a data.js exists; chapter hrefs are placeholders.
const notes = [
  ['Basic Python','terminal-window','yellow',['# Core Python','Printing and getting input','Lists','Conditionals','Loops','Functions','Tuples and dictionaries','Object-oriented programming','Tkinter GUI','Capstone: Tkinter study planner','# Prep for AI Development','os: files and folders','sys: arguments and the interpreter','NumPy: arrays','Matplotlib: plots','Pandas: tables'],'M.4 Foundations'],
  ['Circuits, Arduino & GPIO','cpu','peach',['# Circuit basics','Voltage, current and resistance','Series, parallel and mixed circuits','Circuit diagrams and measuring','# Get to know the hardware','The Arduino board','Pins deep dive: digital, PWM and I2C','Breadboard basics','# Software','Arduino IDE and the sketch','# Wire it up','Resistors and the voltage divider','LED: blink, and active-high vs active-low','Button: digital input, pull-up and pull-down','LCD: wiring I2C','Ultrasonic sensor (HC-SR04)','Servo motor with PWM'],'M.4 Foundations'],
  ['Physics in Robotics','robot','green',['# Physics principles','Linear motion','Circular motion','Differential drive: distance and angle to motor speed','# Robot setup','Hardware: ESP32 and motors','# Code setup','Project setup','Motor protocol: Dynamixel 2.0','# CAD','Chassis design in Onshape','# Final mission','The final mission'],'M.4 Foundations'],
  ['LINE Chatbot','chat-text','teal',['# Chatbot basics','What a chatbot is and how it is built','Rule-based NLP: matching what people say','# Dialogflow','Dialogflow intents','# LINE','LINE Official Account and Messaging API','# Backend','Webhook and database: Apps Script and Google Sheets','# Replies and wrap-up','Rich replies: Flex Messages','End to end: check stock'],'M.4 Foundations'],
  ['Raspberry Pi Vision','circuitry','red',['# Know the board','The board and its ports','# Boot and connect','Flashing the OS with Raspberry Pi Imager','HDMI, SSH and VS Code: ways to connect','# Linux on the Pi','Debian commands and the terminal cheatsheet','venv, activate and the break-system-packages error','Editing on the Pi: vim and nano','# GPIO, a quick recap','LED, button, servo and ultrasonic: what they connect to','Driving a motor: the L298N driver and a step-down converter for 12V','# Vision','Hand tracking with MediaPipe','YOLOv8 object detection','Running lightweight','# Wrap-up','Problems we faced'],'M.5 Applied AI'],
  ['Computer Vision','eye','sky',['# Introduction','What is computer vision','# OpenCV basics','Reading and displaying','Mouse events','Crop, flip, rotate and resize','Color spaces','Thresholding and edge detection','Contours','Bitwise operations and masking','# Detection','Haar cascades: face and eye detection','Face recognition','Feature matching (ORB)','Trained object detection (YOLO)','# Beyond OpenCV','Beyond the repo: hand tracking and servo'],'M.5 Applied AI'],
  ['AI Development','brain','mauve',['# AI, ML and DL','AI, ML and DL',
    '# ML: Data and training','Data handling','Epoch, batch size and learning rate',
    '# ML: Supervised','Linear regression','Classification: drawing boundaries',
    '# ML: Unsupervised','Unsupervised learning: K-means and PCA',
    '# ML: Evaluation','Evaluation',
    '# Deep learning','MLP','CNN','RNN, LSTM and GRU','Transformer','Generative models','LLM and RL'
  ],'M.5 Applied AI'],
  ['AI Research','lightbulb','lavender',['Coming soon'],'M.5 Applied AI'],
  ['Research','lightbulb','sapphire',['Coming soon'],'M.6 Capstone'],
  ['Final Project','sparkle','flamingo',['Coming soon'],'M.6 Capstone'],
];
const pages = [['Home','index.html','house'],['Tools','tools.html','wrench'],['Notes','notes.html','notebook'],['Work','work.html','toolbox'],['Roadmap','roadmap.html','map-trifold'],['About Coder','about.html','info'],['About the major','major.html','graduation-cap'],['Projects','projects.html','cube'],['Materials','materials.html','books'],['Changelog','about.html#changelog','clock']];
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const esc = s => s.replace(/&/g,'&amp;');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const icon = n => `<svg class="i"><use href="#i-${n}"/></svg>`;
const href = (g,n) => `chapter.html#${slug(g)}/${slug(n)}`;
const all = notes.flatMap(([g,ic,c,ns]) => ns.filter(n => n !== 'Coming soon' && !n.startsWith('# ')).map(n => ({g,c,n})));
const item = ({g,c,n}) => `<li style="--c:var(--${c})"><a href="${href(g,n)}">${icon('file-text')}${esc(n)}</a></li>`;
const load = k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } };

// build the page chrome around this page's <main class="ed">; the sidebar is the Main tree, unless the page supplies <template id="outline"> (About does) and then it shows that outline
const page = document.body.dataset.page || 'home';
const file = page === 'home' ? 'index.html' : page + '.html';
const main = $('main.ed'), tpl = $('#outline');
document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><pattern id="dots" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" style="fill:var(--o1)"/></pattern><pattern id="dots2" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".8" style="fill:var(--sub1)"/></pattern></defs>' + SPRITE + '</svg>');
const app = document.createElement('div');
app.className = 'app';
app.innerHTML = HEADER
  + `<nav class="act" aria-label="Activity bar">\n    <a href="index.html" id="homebtn" title="Home" aria-label="Home">${icon('house')}</a>` + ACT_REST + '</nav>'
  + '<aside class="side" id="side">'
  + (tpl ? `<div class="panel" id="p-page"><h2>Outline</h2><ul class="tree outline">${tpl.innerHTML}</ul></div>` : '')
  + `<div class="panel" id="p-main"${tpl ? ' hidden' : ''}><h2>Main</h2><div id="tree"></div></div></aside>`;
app.append(main);
app.insertAdjacentHTML('beforeend', FOOTER);
document.body.prepend(app);
$$('.menu a, .act a').forEach(a => a.getAttribute('href') === file && a.classList.add('on'));
// like VS Code, the Welcome tab stays open next to the page you are on
if (page !== 'home') $('.tabs').insertAdjacentHTML('afterbegin', `<a class="tab" href="index.html">${icon('sparkle')}Welcome</a>`);

// Settings opens in the main panel as its own closable tab, over the page, without leaving it
const sview = document.createElement('div');
sview.className = 'view'; sview.id = 'sview'; sview.hidden = true; sview.innerHTML = SETTINGS;
main.append(sview);
const stab = document.createElement('span');
stab.className = 'tab on'; stab.id = 'stab';
stab.innerHTML = icon('gear-six') + '<span>Settings</span><button class="x" type="button" aria-label="Close Settings">×</button>';
const gear = $('#gear'), crumbEl = $('.crumb');
let crumb0 = '';
function openSettings(){
  if (!sview.hidden) return;
  crumb0 = crumbEl.textContent;
  $('.tabs').append(stab); sview.hidden = false; main.classList.add('sopen'); gear.classList.add('on');
  crumbEl.textContent = 'Coder › Settings'; sview.scrollTop = 0;
}
function closeSettings(){
  if (sview.hidden) return;
  stab.remove(); sview.hidden = true; main.classList.remove('sopen'); gear.classList.remove('on');
  crumbEl.textContent = crumb0;
}
gear.onclick = () => sview.hidden ? openSettings() : closeSettings();
stab.querySelector('.x').onclick = closeSettings;
$('.tabs').addEventListener('click', e => { if (e.target.closest('.tab') && !e.target.closest('#stab')) closeSettings(); });

// a page can split into <div class="pane" id data-tab data-icon>; each pane opens as its own closable tab, one shown at a time
const panes = [...$$('.pane')];
if (panes.length) {
  const tabs = $('.tabs'), crumb = $('.crumb'), base = crumb.textContent;
  let opened = panes.map(p => p.id);
  const show1 = cur => {
    tabs.querySelectorAll('.ptab').forEach(t => t.remove());
    tabs.insertAdjacentHTML('beforeend', opened.map(id => { const p = $('#' + id); return `<span class="tab ptab${id === cur ? ' on' : ''}" role="tab">${icon(p.dataset.icon)}<a href="#${id}">${p.dataset.tab}</a></span>`; }).join(''));
    panes.forEach(p => p.hidden = p.id !== cur);
    if ($('#p-page')) showPanel('page');
    $$('.outline a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur));
    crumb.textContent = base + ' › ' + $('#' + cur).dataset.tab;
    $('.view').scrollTop = 0;
  };
  const openTab = id => { closeSettings(); if (!panes.some(p => p.id === id)) id = panes[0].id; if (!opened.includes(id)) opened.push(id); show1(id); };
  document.addEventListener('click', e => {
    const x = e.target.closest('[data-close]'), a = e.target.closest('.tabs a[href^="#"], .outline a[href^="#"]');
    if (x) { const i = opened.indexOf(x.dataset.close), was = !$('#' + x.dataset.close).hidden; opened.splice(i, 1); show1(was ? opened[Math.max(0, i - 1)] : panes.find(p => !p.hidden).id); }
    else if (a) { e.preventDefault(); history.replaceState(null, '', a.getAttribute('href')); openTab(a.getAttribute('href').slice(1)); }
  });
  addEventListener('hashchange', () => openTab(location.hash.slice(1)));
  openTab(location.hash.slice(1));
}

let lastYr = '';
$('#tree').innerHTML = notes.map(([g,ic,c,ns,yr]) => {
  const head = yr !== lastYr ? `<p class="yr">${yr}</p>` : '';
  lastYr = yr;
  return head + `<button class="grp" style="--c:var(--${c})" aria-expanded="false" data-g="${esc(g)}">${icon('caret-right')}<svg class="i f"><use href="#i-${ic}"/></svg><span>${esc(g)}</span></button><ul class="tree">${ns.map(n=>n.startsWith('# ')?`<li class="sub">${esc(n.slice(2))}</li>`:item({g,c,n})).join('')}</ul>`;
}).join('');
const recent = $('#recent');
if (recent) recent.innerHTML = (load('coder:recent') || ['basic-python/capstone-tkinter-study-planner','circuits-arduino-gpio/servo-motor-with-pwm','ai-development/how-training-works'])
  .map(s => all.find(x => slug(x.g)+'/'+slug(x.n) === s)).filter(Boolean)
  .map(x => `<li><a href="${href(x.g,x.n)}">${esc(x.n)}</a><span class="dim">${esc(x.g)}</span></li>`).join('');
$('#count').insertAdjacentText('beforeend', all.length + ' notes');
$('#done').insertAdjacentText('beforeend', (load('coder:done') || []).length + '/' + all.length + ' done');

// the sidebar is the Main tree: one Home icon on the left bar, the title-bar button and Ctrl+B hide or show it
const side = $('#side');
function showPanel(id){ $$('.panel').forEach(el => el.hidden = el.id !== 'p-' + id); }
const open = () => { side.hidden = false; showPanel('main'); };
const toggle = () => { side.hidden = !side.hidden; };
// on the Welcome page the Home icon also hides and shows the tree; on other pages it goes home
$('#homebtn').addEventListener('click', e => { if (page === 'home') { e.preventDefault(); toggle(); } });
function paintGroup(btn, on){
  btn.setAttribute('aria-expanded', on);
  btn.querySelector('use').setAttribute('href', on ? '#i-caret-down' : '#i-caret-right');
}
// open or close a folder in the sidebar, and remember which ones are open (coder:open) for every page and visit
function setGroup(btn, on){
  paintGroup(btn, on);
  try { localStorage.setItem('coder:open', JSON.stringify([...$$('.grp')].filter(b => b.getAttribute('aria-expanded') === 'true').map(b => b.dataset.g))); } catch {}
}
(load('coder:open') || []).forEach(g => { const b = [...$$('.grp')].find(x => x.dataset.g === g); if (b) paintGroup(b, true); });
$('#toggle').onclick = toggle;
$('#tree').onclick = e => { const b = e.target.closest('.grp'); if (b) setGroup(b, b.getAttribute('aria-expanded') !== 'true'); };
$$('[data-open]').forEach(a => a.onclick = e => { e.preventDefault(); open(); });
$$('[data-group]').forEach(a => a.onclick = e => {
  e.preventDefault(); open();
  $$('.grp').forEach(b => setGroup(b, b.dataset.g === a.dataset.group));
});
const find = q => all.filter(x => q && (x.n + ' ' + x.g).toLowerCase().includes(q));

// title bar command search: chapters + pages
const cmd = $('#cmd'), list = $('#cmd-list');
let sel = 0;
function renderCmd(){
  const q = cmd.value.trim().toLowerCase();
  const rows = [
    ...pages.filter(([n]) => n.toLowerCase().includes(q)).map(([n,h,ic]) => [n,h,ic,'page']),
    ...(q ? find(q) : all.slice(0,8)).map(x => [x.n, href(x.g,x.n), 'file-text', x.g]),
  ].slice(0,12);
  sel = Math.min(sel, Math.max(rows.length - 1, 0));
  list.innerHTML = rows.map(([n,h,ic,d],k) => `<li><a href="${h}"${k===sel?' class="sel"':''}>${icon(ic)}${esc(n)}<span class="dim">${esc(d)}</span></a></li>`).join('') || '<li class="none">No results</li>';
  list.hidden = false;
}
cmd.onfocus = () => { sel = 0; renderCmd(); };
cmd.oninput = () => { sel = 0; renderCmd(); };
cmd.onblur = () => setTimeout(() => list.hidden = true, 150);
cmd.onkeydown = e => {
  const n = list.querySelectorAll('a').length;
  if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % n; renderCmd(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + n) % n; renderCmd(); }
  else if (e.key === 'Enter') { const a = list.querySelector('.sel'); if (a) { a.click(); cmd.blur(); } }
  else if (e.key === 'Escape') cmd.blur();
};
$$('[data-cmd]').forEach(a => a.onclick = e => { e.preventDefault(); cmd.focus(); });

addEventListener('keydown', e => {
  if (!e.ctrlKey) return;
  const k = e.key.toLowerCase();
  if (e.shiftKey && k === 'e') { e.preventDefault(); open(); }
  else if (e.shiftKey && k === 'f') { e.preventDefault(); cmd.focus(); }
  else if (!e.shiftKey && k === 'b') { e.preventDefault(); toggle(); }
  else if (!e.shiftKey && (k === 'p' || k === 'k')) { e.preventDefault(); cmd.focus(); }
});
// developer popup: hover shows it while the pointer is on trigger or popup; click pins it open
const dev = $('#dev'), pop = $('#dev-pop');
let pinned = false, devTimer;
function devShow(){
  clearTimeout(devTimer); hideTip(); pop.hidden = false;
  const r = dev.getBoundingClientRect(), w = pop.offsetWidth;
  pop.style.left = Math.max(4, Math.min(r.left + r.width/2 - w/2, innerWidth - w - 4)) + 'px';
  pop.style.bottom = (innerHeight - r.top + 6) + 'px';
}
function devHide(){ if (pinned) return; devTimer = setTimeout(() => { pop.hidden = true; }, 200); }
function devClose(){ pinned = false; dev.setAttribute('aria-expanded', false); pop.hidden = true; }
[dev, pop].forEach(el => { el.addEventListener('pointerenter', devShow); el.addEventListener('pointerleave', devHide); });
dev.onclick = () => { pinned = !pinned; dev.setAttribute('aria-expanded', pinned); pinned ? devShow() : devClose(); };
addEventListener('pointerdown', e => { if (pinned && !e.target.closest('#dev, #dev-pop')) devClose(); });
addEventListener('keydown', e => { if (e.key === 'Escape') devClose(); });
$$('[data-dev]').forEach(a => a.onclick = e => { e.preventDefault(); if (!pinned) dev.click(); });

// custom tooltip: replaces the native title bubble on every [title] element
const tip = document.createElement('div');
tip.className = 'tip'; tip.hidden = true; document.body.append(tip);
let tipTimer;
$$('[title]').forEach(el => { el.dataset.tip = el.title; el.title = ''; });
function showTip(el){
  tip.textContent = el.dataset.tip; tip.hidden = false;
  const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
  const left = el.closest('.act'), up = el.closest('.status');
  const x = left ? r.right + 6 : r.left + r.width/2 - t.width/2;
  const y = left ? r.top + r.height/2 - t.height/2 : up ? r.top - t.height - 6 : r.bottom + 6;
  tip.style.left = Math.max(4, Math.min(x, innerWidth - t.width - 4)) + 'px';
  tip.style.top = Math.max(4, y) + 'px';
}
const hideTip = () => { clearTimeout(tipTimer); tip.hidden = true; };
addEventListener('pointerover', e => { const el = e.target.closest('[data-tip]'); hideTip(); if (el) tipTimer = setTimeout(() => showTip(el), 400); });
addEventListener('focusin', e => { const el = e.target.closest('[data-tip]'); hideTip(); if (el && el.matches(':focus-visible')) showTip(el); });
addEventListener('focusout', hideTip);
addEventListener('pointerdown', hideTip);

if (innerWidth <= 640) side.hidden = true;
