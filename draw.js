var firstDraw = true;

// toggle between deferred textures
var display_type = 0;
// toggle between house/girl
var render_girl = 1;
var render_house = 1;
// blend buffers of house/girl
var alpha_girl = 1.0;
var alpha_house = 0.5;

var vboVertexBuffer;
var vboTextureBuffer;
var vboIndexBuffer;

var gbufferHouse;
var gbufferGirl;

var step = 0;

var light6X = 0;
var light6Y = 0;
var light6Z = 0;

function animateLight() {
    light6X += 0.1;
    light6Y += 0.1;
    light6Z = 5.0;

    lightPos5 = [0.0, 15.0*Math.cos(light6X), 0.0];
    lightPos6 = [15.0*Math.sin(light6X), 0.0, 0.0];
}

function drawScene() {
    if ( meshesToLoad > 0 || imagesToLoad > 0 ) {
        console.log("scene not loaded. meshesToLoad: " + meshesToLoad + " texturesToLoad " + imagesToLoad);
        firstDraw = true;
        return;  
    } else if ( firstDraw ){
        console.log("loading scene");

        initTextures( images );
        initMeshBuffers( gl, meshes );
        initQuadBuffers();

        gbufferHouse = new Gbuffer();
        gbufferHouse.initGbuffer();

        gbufferGirl = new Gbuffer();
        gbufferGirl.initGbuffer();

        firstDraw = false;
    }
    animateLight();

    // setup the camera
    var projectionMatrix = mat4.create();
    var mvMatrix = mat4.create();
    var camMatrix = mat4.create();

    mat4.perspective(projectionMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.01, 100000.0);
    var eye = [0.0, 0.0, -5.0];
    var target = [0.0, 0.0, 0.0];
    var up = [0, 1, 0];
    mat4.lookAt(camMatrix, eye, target, up);
    mat4.invert(mvMatrix, camMatrix);

    // object transformation matrix
    mat4.rotateX(mvMatrix, mvMatrix, objXRotation);
    mat4.rotateY(mvMatrix, mvMatrix, objYRotation);
    mat4.translate(mvMatrix, mvMatrix, objTranslation);

    // *************
    // Geometry Pass
    // *************
    gl.useProgram(geoShaderProgram);

    // -----------------
    // Render Girl Mesh
    // - rendered first to be fully opaque
    // -----------------
    // Re-bind framebuffer to draw to textures
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, gbufferGirl.framebuffer);

    // send camera matrices to geoShaders
    gl.uniformMatrix4fv(geoShaderProgram.pMatUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(geoShaderProgram.mvMatUniform, false, mvMatrix);

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // set clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    renderMesh(girlMesh);

    // -----------------
    // Render House Mesh
    // - rendered second to blend with existing girl
    // -----------------
    // Re-bind framebuffer to draw to textures
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, gbufferHouse.framebuffer);

    // send camera matrices to geoShaders
    gl.uniformMatrix4fv(geoShaderProgram.pMatUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(geoShaderProgram.mvMatUniform, false, mvMatrix);

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // set clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    renderMesh(houseMesh);

    // Un-bind framebuffers to draw to screen
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // *************
    // Lighting Pass
    // *************
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(lightShaderProgram);

    // Setup screen quad
    // girl textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gbufferGirl.normalTexture);
    gl.uniform1i(lightShaderProgram.normalTexUniformGirl, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, gbufferGirl.positionTexture);
    gl.uniform1i(lightShaderProgram.positionTexUniformGirl, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, gbufferGirl.colorTexture);
    gl.uniform1i(lightShaderProgram.colorTexUniformGirl, 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, gbufferGirl.depthTexture);
    gl.uniform1i(lightShaderProgram.depthTexUniformGirl, 3);

    // house textures
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, gbufferHouse.normalTexture);
    gl.uniform1i(lightShaderProgram.normalTexUniformHouse, 4);

    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, gbufferHouse.positionTexture);
    gl.uniform1i(lightShaderProgram.positionTexUniformHouse, 5);

    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, gbufferHouse.colorTexture);
    gl.uniform1i(lightShaderProgram.colorTexUniformHouse, 6);

    gl.activeTexture(gl.TEXTURE7);
    gl.bindTexture(gl.TEXTURE_2D, gbufferHouse.depthTexture);
    gl.uniform1i(lightShaderProgram.depthTexUniformHouse, 7);

    //gl.disable(SCISSOR_TEST); // TODO
    // TODO: could clean up passing display_type directly from UI
    gl.uniform1i(lightShaderProgram.displayModeUniform, display_type);

    gl.uniform1i(lightShaderProgram.renderGirlUniform, render_girl);
    gl.uniform1i(lightShaderProgram.renderHouseUniform, render_house);
    gl.uniform1f(lightShaderProgram.alphaGirlUniform, alpha_girl);
    gl.uniform1f(lightShaderProgram.alphaHouseUniform, alpha_house);

    gl.uniform3fv(lightShaderProgram.lightPos1Uniform, lightPos1);
    gl.uniform3fv(lightShaderProgram.lightPos2Uniform, lightPos2);
    gl.uniform3fv(lightShaderProgram.lightPos3Uniform, lightPos3);
    gl.uniform3fv(lightShaderProgram.lightPos4Uniform, lightPos4);
    gl.uniform3fv(lightShaderProgram.lightPos5Uniform, lightPos5);
    gl.uniform3fv(lightShaderProgram.lightPos6Uniform, lightPos6);

    gl.uniform3fv(lightShaderProgram.lightColor1Uniform, lightColor1);
    gl.uniform3fv(lightShaderProgram.lightColor2Uniform, lightColor2);
    gl.uniform3fv(lightShaderProgram.lightColor3Uniform, lightColor3);
    gl.uniform3fv(lightShaderProgram.lightColor4Uniform, lightColor4);
    gl.uniform3fv(lightShaderProgram.lightColor5Uniform, lightColor5);
    gl.uniform3fv(lightShaderProgram.lightColor6Uniform, lightColor6);
    
    // Draw screen quad
    gl.bindBuffer(gl.ARRAY_BUFFER, vboVertexBuffer);
    gl.vertexAttribPointer(lightShaderProgram.vertexPositionAttribute,
            vboVertexBuffer.itemSize,
            gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vboTextureBuffer);
    gl.vertexAttribPointer(lightShaderProgram.textureCoordAttribute,
            vboTextureBuffer.itemSize,
            gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vboIndexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

}

function renderMesh(mesh) {
    for( var j = 0; j < mesh.groups.length; j++ ) {
        gl.bindBuffer(
                gl.ARRAY_BUFFER, mesh.groups[j].vertexBuffer);
        gl.vertexAttribPointer(
                //mesh.program.vertexPositionAttribute,TODO 
                geoShaderProgram.vertexPositionAttribute,
                mesh.groups[j].vertexBuffer.itemSize, 
                gl.FLOAT, false, 0, 0);

        gl.bindBuffer(
                gl.ARRAY_BUFFER, mesh.groups[j].normalBuffer);
        gl.vertexAttribPointer(
                //mesh.program.vertexPositionAttribute,TODO 
                geoShaderProgram.vertexNormalAttribute,
                mesh.groups[j].normalBuffer.itemSize, 
                gl.FLOAT, false, 0, 0);

        gl.bindBuffer(
                gl.ARRAY_BUFFER, mesh.groups[j].textureBuffer);
        gl.vertexAttribPointer(
                //mesh.program.vertexPositionAttribute,TODO 
                geoShaderProgram.textureCoordAttribute,
                mesh.groups[j].textureBuffer.itemSize, 
                gl.FLOAT, false, 0, 0);

        // enable texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(
                gl.TEXTURE_2D, imageTextures[mesh.groups[j].materialPath]);
        gl.uniform1i(geoShaderProgram.samplerUniform, 0);

        gl.uniform1f(geoShaderProgram.alphaUniform, mesh.alphaChannel);

        // draw indices to screen
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.groups[j].indexBuffer);
        // gl.polygonOffset(1.0, 1.0); maybe
        gl.drawElements(
            gl.TRIANGLES, 
            mesh.groups[j].indexBuffer.numItems, 
            gl.UNSIGNED_SHORT, 0);
    }
}

function initQuadBuffers () {
    var positions = new Float32Array([
            -1.0, 1.0, 0.0,
            -1.0,-1.0, 0.0,
             1.0,-1.0, 0.0,
             1.0, 1.0, 0.0]);
    var textures = new Float32Array([
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0]);
    var indices = [0, 1, 2, 0, 2, 3];

   vboVertexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vboVertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
   vboVertexBuffer.itemSize = 3;

   vboTextureBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vboTextureBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);
   vboTextureBuffer.itemSize = 2;

   vboIndexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vboIndexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
   vboIndexBuffer.itemSize = 1;
}

function animateMyScene() {
    requestAnimationFrame(animateMyScene);  // js convention for animation
    drawScene();
}

