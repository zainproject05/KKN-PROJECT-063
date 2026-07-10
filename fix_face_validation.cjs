const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Inside checkPhoto function
// img.onload = async () => {
//   const hasFace = await detectFace(img);
//   setFaceDetected(hasFace);
//   if (hasFace) { ... } else { ... }

content = content.replace(
  'const hasFace = await detectFace(img);\n      setFaceDetected(hasFace);',
  'setFaceValidationStatus("checking");\n      const hasFace = await detectFace(img);\n      setFaceDetected(hasFace);\n      setFaceValidationStatus(hasFace ? "success" : "failed");'
);

content = content.replace(
  'setFaceDetected(false);\n    setPhotoValidMsg("");\n    \n    try {',
  'setFaceDetected(false);\n    setFaceValidationStatus("idle");\n    setPhotoValidMsg("");\n    \n    try {'
);

content = content.replace(
  'setFaceDetected(false);\n    setPhotoValidMsg("");\n    startCamera();',
  'setFaceDetected(false);\n    setFaceValidationStatus("idle");\n    setPhotoValidMsg("");\n    startCamera();'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated faceValidationStatus logic.");
