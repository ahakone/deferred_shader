var canvas;
var gl;
var ext;

var shaderProgram;
// deffered shaders
var geoShaderProgram;   // geometry pass shaders
var lightShaderProgram; // lighting pass shaders

var houseMesh;
var girlMesh;

var meshes = [];
var meshesToLoad = 0;

var images = [];
var imagesToLoad = 0;
var imageTextures = {};

var lightPos1 = [5.0, 0.0, 0.0];  // right
var lightPos2 = [-5.0, 0.0, 0.0]; // left
var lightPos3 = [1.0, 0.0, 5.0];  // front
var lightPos4 = [0.0, 0.0, -5.0]; // back
var lightPos5 = [0.0, 5.0, 0.0];  // top
var lightPos6 = [0.0, -5.0, 0.0]; // bottom

var lightColor1 = [1.0, 0.0, 0.0];  // right
var lightColor2 = [0.0, 1.0, 0.0];  // left
var lightColor3 = [0.0, 0.0, 1.0];  // front
var lightColor4 = [1.0, 1.0, 0.0];  // back
var lightColor5 = [0.0, 0.0, 1.0];  // top
var lightColor6 = [1.0, 0.0, 0.0];  // bottom

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var objXRotation = 0;
var objYRotation = Math.PI;
var objTranslation = [0, 0, 0];

// Called when the canvas is created to start process
function start() {
    canvas = document.getElementById("glCanvas");

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    initWebGL(canvas); // initializes gl

    // only continue if WebGL is available and working
    if (gl) {
        //var ext = gl.getExtension("OES_element_index_uint");
        ext = gl.getExtension("WEBGL_draw_buffers");
        gl.getExtension("OES_texture_float_linear");

        gl.clearColor(0.0, 0.0, 0.0, 1.0); // set clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        initShaders();
        initObjMeshNew("data/old_house/old_house.obj", 
                "data/old_house/old_house.mtl", 'house', 1.0);
        initObjMeshNew("data/toot/Toot_Braustein.obj",
                "data/toot/Toot_Braustein.mtl", 'girl', 1.0);

        animateMyScene();
    }
};

function initWebGL(canvas) {
    gl = null;
    try {
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        gl.viewport(0, 0, canvas.width, canvas.height);
    } 
    catch (e) {
    }
    if (!gl) {
        alert("cannot initialize webGL");
        gl = null;
    }
}

function initGeometryShaders() {
    var vs = loadShader("geometry-pass-vs");
    var fs = loadShader("geometry-pass-fs");

    geoShaderProgram = gl.createProgram();
    gl.attachShader(geoShaderProgram, vs);
    gl.attachShader(geoShaderProgram, fs);
    gl.linkProgram(geoShaderProgram);
    if (!gl.getProgramParameter(geoShaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize geoShaders");
    }
    //gl.useProgram(geoShaderProgram); TODO: when to use shader?

    // attach shader attributes to the geoShaderProgram
    geoShaderProgram.vertexPositionAttribute = gl.getAttribLocation(
            geoShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(
            geoShaderProgram.vertexPositionAttribute);

    geoShaderProgram.vertexNormalAttribute = gl.getAttribLocation(
            geoShaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(
            geoShaderProgram.vertexNormalAttribute);

    geoShaderProgram.textureCoordAttribute = gl.getAttribLocation(
            geoShaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(
            geoShaderProgram.textureCoordAttribute);

    geoShaderProgram.samplerUniform = gl.getUniformLocation(
            geoShaderProgram, "uSampler");

    geoShaderProgram.alphaUniform = gl.getUniformLocation(
            geoShaderProgram, "uAlphaColor");

    geoShaderProgram.pMatUniform = gl.getUniformLocation(
            geoShaderProgram, "uPMatrix");

    geoShaderProgram.mvMatUniform = gl.getUniformLocation(
            geoShaderProgram, "uMVMatrix");
}

function initLightShaders() {
    var vs = loadShader("lighting-pass-vs");
    var fs = loadShader("lighting-pass-fs");

    lightShaderProgram = gl.createProgram();
    gl.attachShader(lightShaderProgram, vs);
    gl.attachShader(lightShaderProgram, fs);
    gl.linkProgram(lightShaderProgram);
    if (!gl.getProgramParameter(lightShaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize lightShaders");
    }
    //gl.useProgram(lightShaderProgram); TODO: when to use shader?

    // attach shader attributes to the lightShaderProgram
    lightShaderProgram.vertexPositionAttribute = gl.getAttribLocation(
            lightShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(
            lightShaderProgram.vertexPositionAttribute);

    lightShaderProgram.textureCoordAttribute = gl.getAttribLocation(
            lightShaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(
            lightShaderProgram.textureCoordAttribute);

    lightShaderProgram.positionTexUniformGirl = gl.getUniformLocation(
            lightShaderProgram, "uPositionTexGirl");
    lightShaderProgram.normalTexUniformGirl = gl.getUniformLocation(
            lightShaderProgram, "uNormalTexGirl");
    lightShaderProgram.colorTexUniformGirl = gl.getUniformLocation(
            lightShaderProgram, "uColorTexGirl");
    lightShaderProgram.depthTexUniformGirl = gl.getUniformLocation(
            lightShaderProgram, "uDepthTexGirl");

    lightShaderProgram.positionTexUniformHouse = gl.getUniformLocation(
            lightShaderProgram, "uPositionTexHouse");
    lightShaderProgram.normalTexUniformHouse = gl.getUniformLocation(
            lightShaderProgram, "uNormalTexHouse");
    lightShaderProgram.colorTexUniformHouse = gl.getUniformLocation(
            lightShaderProgram, "uColorTexHouse");
    lightShaderProgram.depthTexUniformHouse = gl.getUniformLocation(
            lightShaderProgram, "uDepthTexHouse");

    lightShaderProgram.displayModeUniform = gl.getUniformLocation(
            lightShaderProgram, "display_mode");

    lightShaderProgram.renderGirlUniform = gl.getUniformLocation(
            lightShaderProgram, "render_girl");
    lightShaderProgram.renderHouseUniform = gl.getUniformLocation(
            lightShaderProgram, "render_house");
    lightShaderProgram.alphaGirlUniform = gl.getUniformLocation(
            lightShaderProgram, "alpha_girl");
    lightShaderProgram.alphaHouseUniform = gl.getUniformLocation(
            lightShaderProgram, "alpha_house");

    lightShaderProgram.lightPos1Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightPos1");
    lightShaderProgram.lightPos2Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightPos2");
    lightShaderProgram.lightPos3Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightPos3");
    lightShaderProgram.lightPos4Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightPos4");
    lightShaderProgram.lightPos5Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightPos5");
    lightShaderProgram.lightPos6Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightPos6");

    lightShaderProgram.lightColor1Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightColor1");
    lightShaderProgram.lightColor2Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightColor2");
    lightShaderProgram.lightColor3Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightColor3");
    lightShaderProgram.lightColor4Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightColor4");
    lightShaderProgram.lightColor5Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightColor5");
    lightShaderProgram.lightColor6Uniform = gl.getUniformLocation(
            lightShaderProgram, "lightColor6");
}

function initShaders() {
    initGeometryShaders();
    initLightShaders();
}

function initForwardShaders() {
    var fragmentShader = loadShader("shader-fs");
    var vertexShader = loadShader("shader-vs");

    // Create the shader program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders");
    }
    gl.useProgram(shaderProgram);

    // attach shader attributes to the shaderProgram
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
            shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(
            shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(
            shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(
            shaderProgram.vertexNormalAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(
            shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(
            shaderProgram.textureCoordAttribute);

    shaderProgram.samplerUniform = gl.getUniformLocation(
            shaderProgram, "uSampler");
}

function loadMeshImages( mesh ) {
    for (var j = 0; j < mesh.groups.length; j++) {
        if (!(mesh.groups[j].materialPath in imageTextures)) {
            imagesToLoad += 1;
            var image = new Image();
            image.src = mesh.groups[j].materialPath;
            //image.src = 'data/toot/Toot_Braustein.jpg'
            image.materialPath = mesh.groups[j].materialPath;
            image.onload = function() { imagesToLoad--; };
            images.push(image);
        }
    }
}

function initTexture( image ) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);  //this line flips the texture image upside down
    //gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    //gl.generateMipmap(gl.TEXTURE_2D);
    
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image ); 

    // unbind main texture buffer
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
}

function initTextures( images ) {
    for (var j = 0; j < images.length; j++) {
        var texture = initTexture( images[j] );
        imageTextures[images[j].materialPath] = texture;
        console.log("loaded " + images[j].materialPath + " " + imageTextures[images[j].materialPath]);
    }
}

function loadShader(id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
    alert ("shader id does not exist: " + id);
        return null;
    }

    var str = "";
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
        if (currentChild.nodeType == Node.TEXT_NODE) {
            str += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        alert ("gl createShader failed: " + id);
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initObjMeshNew( objFilename, mtlFilename, mesh, alphaChannel ) {
    meshesToLoad += 1;
    var objMtlLoader = new ObjLoader();
    objMtlLoader.load( objFilename, mtlFilename, function(err, result) {
            if(err) { /*TODO: Handle error here*/ }

            // load and adjust position of mesh
            if ( mesh == 'house' ) {
                houseMesh = objLoaderToMeshBuffer( result );
                centerMesh(houseMesh);
                scaleMesh(houseMesh, 2.0);
                houseMesh.alphaChannel = alphaChannel;

                // setup textures for this mesh
                loadMeshImages( houseMesh );

                // add mesh to array to meshes to draw
                meshes.push( houseMesh );
                console.log(houseMesh);
            } else if (mesh == 'girl') {
                girlMesh = objLoaderToMeshBuffer( result );
                centerMesh(girlMesh);
                scaleMesh(girlMesh, 2.0);
                girlMesh.alphaChannel = alphaChannel;

                // setup textures for this mesh
                loadMeshImages( girlMesh );

                // add mesh to array to meshes to draw
                meshes.push( girlMesh );
                console.log(girlMesh);
            }
            meshesToLoad -= 1;
    });
}

function _buildBuffer( gl, type, data, itemSize ){
    var buffer = gl.createBuffer();
    var arrayView = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new arrayView(data), gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = data.length / itemSize;
    return buffer;
}

function initMeshBuffers( gl, meshes ) {
    for( var i = 0; i < meshes.length; i++ ) {
        var mesh = meshes[i];
        for( var j = 0; j < mesh.groups.length; j++ ) {
            mesh.groups[j].normalBuffer = _buildBuffer(
                    gl, gl.ARRAY_BUFFER, mesh.groups[j].normals, 3);
            mesh.groups[j].textureBuffer = _buildBuffer(
                    gl, gl.ARRAY_BUFFER, mesh.groups[j].texCoords, 2);
            mesh.groups[j].vertexBuffer = _buildBuffer(
                    gl, gl.ARRAY_BUFFER, mesh.groups[j].vertices, 3);
            mesh.groups[j].indexBuffer = _buildBuffer(
                    gl, gl.ELEMENT_ARRAY_BUFFER, mesh.groups[j].indices, 1);
        }
    }
}

function deleteMeshBuffers ( gl, mesh ){
    for( var i = 0; i < meshes.length; i++ ) {
        var mesh = meshes[i];
        for( var j = 0; j < mesh.groups.length; j++ ) {
            gl.deleteBuffer(mesh.groups[j].normalBuffer);
            gl.deleteBuffer(mesh.groups[j].textureBuffer);
            gl.deleteBuffer(mesh.groups[j].vertexBuffer);
            gl.deleteBuffer(mesh.groups[j].indexBuffer);
        }
    }
}

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;
    var deltaX = lastMouseX - newX;
    var deltaY = lastMouseY - newY;

    //if (newX > canvas.width) newX = canvas.width;
    //if (newX < 0) newX = 0;
    //if (newY > canvas.height) newY = canvas.height;
    //if (newY < 0) newY = 0;

    var percentX = deltaX / (canvas.width / 2.0);
    objYRotation += percentX * (Math.PI);

    var percentY = deltaY / (canvas.height / 2.0);
    objXRotation += percentY * (Math.PI);

    lastMouseX = newX;
    lastMouseY = newY;
}

