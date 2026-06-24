// firebase-config.js

!function(e,t,r,n,a,o,i){e[a]=e[a]||{};var s="",l=function(e){return atob(e)},c=function(e,t){for(var r="",n=0;n<e.length;n++)r+=String.fromCharCode(e.charCodeAt(n)^t.charCodeAt(n%t.length));return r};o=[["QUl6YVN5Q01VdzhLd0NlU05ZNDFpNUVtcXFLZXh6THA1UlJNTm9Z","YXBpS2V5"],["ZGFmdGFyLWFic2VuLWNjODY4LmZpcmViYXNlYXBwLmNvbQ==","YXV0aERvbWFpbg=="],["aHR0cHM6Ly9kYWZ0YXItYWJzZW4tY2M4NjgtZGVmYXVsdC1ydGRiLmFzaWEtc291dGhlYXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcA==","ZGF0YWJhc2VVUkw="],["ZGFmdGFyLWFic2VuLWNjODY4","cHJvamVjdElk"],["MTo0ODY0MDQ3NTk2Mzc6d2ViOjEyMDQwNGZkZTNlMGMxZjFkMGI0ZGM=","YXBwSWQ="]];for(var d=0;d<o.length;d++)e[a][l(o[d][1])]=c(l(o[d][0]),"kunciAcakBebasDiubah2026")}(window,document,navigator,location,"firebaseConfig");


// Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
