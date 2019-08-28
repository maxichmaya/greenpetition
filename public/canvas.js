// canvas element and x&y coordinates

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d"); //gets that element's context—the thing onto which the drawing will be rendered
var mouseX;
var mouseY;
var signature;

function makeSignature(e) {
    if (signature == true) {
        context.strokeStyle = "green";
        context.beginPath();
        context.moveTo(mouseX, mouseY);
        context.lineTo(e.offsetX, e.offsetY);
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        context.stroke();
        context.lineJoin = "round";
    }
}
// making a signature
canvas.addEventListener("mousedown", e => {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    signature = true;
    canvas.addEventListener("mousemove", makeSignature);

    canvas.addEventListener("mouseup" && "click", () => {
        signature = false;
        var dataURL = canvas.toDataURL();
        var signatureInk = document.getElementById("signatureInk");
        signatureInk.value = dataURL;
        console.log(dataURL);
        console.log("canvas:", canvas);
    });
});
