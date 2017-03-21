function keyPress(e){
    var keynum;
    
    if (window.event){ // IE                 
	keynum = e.keyCode;
    } 
    else {
	if (e.which){ // Netscape/Firefox/Opera                  
	    keynum = e.which;
	}
    }

    switch (keynum) {
    case 81:
        display_type = 0;
        break;
    case 87: 
        display_type = 1;
        break;
    case 69: 
        display_type = 2;
        break;
    case 82: 
        display_type = 3;
        break;
    case 84: 
        display_type = 4;
        break;
    default:
        break;
    }
    showMode();
}

function showMode() {
    if (display_type == 0) {
        $("#currMode").html("Deferred shading");
    }
    else if (display_type == 1) {
        $("#currMode").html("Normals");
    }
    else if (display_type == 2) {
        $("#currMode").html("Position");
    }
    else if (display_type == 3) {
        $("#currMode").html("Color");
    }
    else if (display_type == 4) {
        $("#currMode").html("Depth");
    }
}

function changeLightPos(dom) {
    lightPosHTML[dom.id][lightPosHTMLxyz[dom.id]] = 
        parseFloat(dom.value);
}

function changeLightRGB(dom) {
    lightRGBHTML[dom.id][lightRGBHTMLRGB[dom.id]] = 
        parseFloat(dom.value);
}

document.addEventListener("keydown", keyPress, false);

// $("#houseAlpha").change(function () {
//     console.log("hi");
//     $("#houseAlphaO").html = $("#houseAlpha").val();
// });

var lightPosHTML = {
    light1x: lightPos1,
    light1y: lightPos1,
    light1z: lightPos1,
    light2x: lightPos2,
    light2y: lightPos2,
    light2z: lightPos2,
    light3x: lightPos3,
    light3y: lightPos3,
    light3z: lightPos3,
    light4x: lightPos4,
    light4y: lightPos4,
    light4z: lightPos4,
    light5x: lightPos5,
    light5y: lightPos5,
    light5z: lightPos5
};
var lightPosHTMLxyz = {
    light1x: 0,
    light1y: 1, 
    light1z: 2, 
    light2x: 0, 
    light2y: 1, 
    light2z: 2, 
    light3x: 0, 
    light3y: 1, 
    light3z: 2, 
    light4x: 0, 
    light4y: 1, 
    light4z: 2, 
    light5x: 0, 
    light5y: 1, 
    light5z: 2
};

var lightRGBHTML = {
    light1r: lightColor1,
    light1g: lightColor1,
    light1b: lightColor1,
    light2r: lightColor2,
    light2g: lightColor2,
    light2b: lightColor2,
    light3r: lightColor3,
    light3g: lightColor3,
    light3b: lightColor3,
    light4r: lightColor4,
    light4g: lightColor4,
    light4b: lightColor4,
    light5r: lightColor5,
    light5g: lightColor5,
    light5b: lightColor5,
    light6r: lightColor6,
    light6g: lightColor6,
    light6b: lightColor6
};
var lightRGBHTMLRGB = {
    light1r: 0,
    light1g: 1, 
    light1b: 2, 
    light2r: 0, 
    light2g: 1, 
    light2b: 2, 
    light3r: 0, 
    light3g: 1, 
    light3b: 2, 
    light4r: 0, 
    light4g: 1, 
    light4b: 2, 
    light5r: 0, 
    light5g: 1, 
    light5b: 2,
    light6r: 0, 
    light6g: 1, 
    light6b: 2
};

var renderCheckHTML = {
    houseCheck: render_house,
    girlCheck: render_girl
};

var alphaHTML = {
    houseAlpha: alpha_house,
    girlAlpha: alpha_girl
};

function changeRender(dom) {
    if (dom.checked) {
        renderCheckHTML[dom.id] = 1;
    }
    else {
        renderCheckHTML[dom.id] = 0;
    }
}

function changeAlpha(dom) {
    console.log(dom.value);
    alphaHTML[dom.id] = parseFloat(dom.value);
}

