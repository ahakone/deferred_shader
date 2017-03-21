//var stream = require('stream');
//var split = require('split');
//var xhr = require('xhr');


function ObjLoader() {

  this.vertices = [];
  this.normals = [];
  this.textureCoords = [];
  this.faces = [];
  this.facesMaterialsIndex = [{materialName: null, materialStartIndex: 0}];
  this.materials = [];

}

function objLoaderToMeshBuffer( result ) {

    var mesh = {};

    var vertices = result.vertices;
    var faces = result.faces;
    var normals = result.normals;
    var textureCoords = result.textureCoords;
    var facesMaterialsIndex = result.facesMaterialsIndex;
    var materials = result.materials;
    console.log(materials);

    // save all material information to mesh
    mesh.materials = [];
    if(materials) {
      for(var i = 0; i < materials.length; ++i) {
        mesh.materials.push(materials[i]);
      }
    }

    // save all vertex, normals, and texCoord information to mesh
    var maxPos = 0;
    var xmin = 100000;
    var xmax = -100000;
    var ymin = 100000;
    var ymax = -100000;
    var zmin = 100000;
    var zmax = -100000;

    mesh.groups = [];
    if(facesMaterialsIndex) {
        for(var k = 0; k < facesMaterialsIndex.length; ++k) {

          var faceGroup = {};

          // find material index of current faces group
          var materialName = facesMaterialsIndex[k].materialName;
          faceGroup.materialName = materialName;

          var currentMatIndex = 0;
          for(var p = 0; p < materials.length; ++p) {
              if(materials[p].name === materialName) {
                  currentMatIndex = p;
              }
          }
          faceGroup.materialIndex = currentMatIndex;
          faceGroup.materialPath = materials[currentMatIndex].diffuseMap;

          // find start and end indices that apply to this faces group
          var startIndex = facesMaterialsIndex[k].materialStartIndex;
          var endIndex = k+1 < facesMaterialsIndex.length ? 
              facesMaterialsIndex[k+1].materialStartIndex : faces.length;

          // iterate through all faces in this group and save indices
          var vertexIndices = [];
          var normalIndices = [];
          var textureIndices = [];
          for(var i = startIndex; i < endIndex; ++i) {
              var quad = false;
              for(var j = 0; j < faces[i].indices.length; j++) {
                if(j === 3 && !quad) {
                    j = 2;
                    quad = true;
                }
                vertexIndices.push(faces[i].indices[j]);
                normalIndices.push(faces[i].normal[j]);
                textureIndices.push(faces[i].texture[j]);
                if(j === 3 && quad) {
                    vertexIndices.push(faces[i].indices[0]);
                    normalIndices.push(faces[i].normal[0]);
                    textureIndices.push(faces[i].texture[0]);
                }
              }
          }

          // create flattened arrays of values
          var newIndex = 0;
          var indexMap = {};
          faceGroup.indices = [];
          faceGroup.vertices = [];
          faceGroup.normals = [];
          faceGroup.texCoords = [];
          for(var i = 0; i < vertexIndices.length; i++) {
              var vi = vertexIndices[i];
              var vn = normalIndices[i];
              var vt = textureIndices[i];
              var key = vi + '-' + vn + '-' + vt;
              if (!(key in indexMap)) {
                  faceGroup.vertices.push(vertices[vi - 1][0]);
                  faceGroup.vertices.push(vertices[vi - 1][1]);
                  faceGroup.vertices.push(vertices[vi - 1][2]);
                    
                  // get max position overall
                  if (maxPos < Math.abs(vertices[vi - 1][0])) {
                    maxPos = Math.abs(vertices[vi - 1][0]);
                  }
                  if (maxPos < Math.abs(vertices[vi - 1][1])) {
                    maxPos = Math.abs(vertices[vi - 1][1]);
                  }
                  if (maxPos < Math.abs(vertices[vi - 1][2])) {
                    maxPos = Math.abs(vertices[vi - 1][2]);
                  }

                  // get max in each direction
                  if (vertices[vi - 1][0] < xmin) {
                    xmin = vertices[vi - 1][0];
                  }
                  if (vertices[vi - 1][0] > xmax) {
                    xmax = vertices[vi - 1][0];
                  }
                  if (vertices[vi - 1][0] < ymin) {
                    ymin = vertices[vi - 1][1];
                  }
                  if (vertices[vi - 1][0] > ymax) {
                    ymax = vertices[vi - 1][1];
                  }
                  if (vertices[vi - 1][0] < zmin) {
                    zmin = vertices[vi - 1][2];
                  }
                  if (vertices[vi - 1][0] > zmax) {
                    zmax = vertices[vi - 1][2];
                  }

                  faceGroup.normals.push(normals[vn - 1][0]);
                  faceGroup.normals.push(normals[vn - 1][1]);
                  faceGroup.normals.push(normals[vn - 1][2]);

                  faceGroup.texCoords.push(textureCoords[vt - 1][0]);
                  faceGroup.texCoords.push(textureCoords[vt - 1][1]);

                  //indexMap[key] = newIndex;
                  //newIndex += 1;
              }

              //faceGroup.indices.push(indexMap[key]);
              faceGroup.indices.push(newIndex);
              newIndex += 1;
          }

          // add current face group to mesh
          mesh.groups.push(faceGroup);
        }

      mesh.maxPos = parseFloat(maxPos);
      mesh.xmin = parseFloat(xmin);
      mesh.xmax = parseFloat(xmax);
      mesh.ymin = parseFloat(ymin);
      mesh.ymax = parseFloat(ymax);
      mesh.zmin = parseFloat(zmin);
      mesh.zmax = parseFloat(zmax);

    }
    return mesh;
}

function moveMesh( mesh, xadj, yadj, zadj ) {
    for (var i = 0; i < mesh.groups.length; i++ ){
        for (var j = 0; j < mesh.groups[i].vertices.length / 3; j++) {
            mesh.groups[i].vertices[j * 3 + 0] += xadj;
            mesh.groups[i].vertices[j * 3 + 1] += yadj;
            mesh.groups[i].vertices[j * 3 + 2] += zadj;
        }
    }
}

function centerMesh( mesh ) {
    var xavg = (mesh.xmax + mesh.xmin) / 2.0;
    var yavg = (mesh.ymax + mesh.ymin) / 4.0;
    var zavg = (mesh.zmax + mesh.zmin) / 2.0;
    moveMesh( mesh, -xavg, -yavg, -zavg);
}

function scaleMesh( mesh, sFactor ) {
    for (var i = 0; i < mesh.groups.length; i++ ){
        for (var j = 0; j < mesh.groups[i].vertices.length / 3; j++) {
            mesh.groups[i].vertices[j * 3 + 0] = 
                (mesh.groups[i].vertices[j * 3 + 0] * sFactor / mesh.maxPos);
            mesh.groups[i].vertices[j * 3 + 1] = 
                (mesh.groups[i].vertices[j * 3 + 1] * sFactor / mesh.maxPos);
            mesh.groups[i].vertices[j * 3 + 2] = 
                (mesh.groups[i].vertices[j * 3 + 2] * sFactor / mesh.maxPos);
         }
    }
}


ObjLoader.prototype.load = function( objFilePath, mtlFilePath, callback ) {

  var self = this;

  if(typeof mtlFilePath === "function") {
    callback = mtlFilePath;
    mtlFilePath = "";
  }

  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", objFilePath, true);
  rawFile.onreadystatechange = function () {
      if(rawFile.readyState === 4) {
          if(rawFile.status === 200 || rawFile.status == 0) {
              var objectData = rawFile.responseText;
              var lines = objectData.split('\n');
              for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                self.parseObj(line);
              }

              // on end
              // parse MTL file
              var rawMTLFile = new XMLHttpRequest();
              rawMTLFile.open("GET", mtlFilePath, true);
              rawMTLFile.onreadystatechange = function () {
                  if(rawMTLFile.readyState === 4) {
                      if(rawMTLFile.status === 200 || rawMTLFile.status == 0) {
                          var mtlData = rawMTLFile.responseText;
                          var lines = mtlData.split('\n');
                          var currentMat = {};
                          for (var i = 0; i < lines.length; i++) {
                              var line = lines[i].trim();
                              currentMat = self.parseMtl(line, currentMat);
                          }

                          // on end
                          if(currentMat.name) {
                              self.materials.push(currentMat);
                          }

                          /*Geometry and Materials*/
                          callback(
                              null,
                              {
                                vertices: self.vertices,
                                normals: self.normals,
                                textureCoords: self.textureCoords,
                                faces: self.faces,
                                facesMaterialsIndex: self.facesMaterialsIndex,
                                materials: self.materials
                              }
                          );
                      } else {
                          /*Geometry Only*/
                          callback(
                              null,
                              {
                                vertices: self.vertices,
                                normals: self.normals,
                                textureCoords: self.textureCoords,
                                faces: self.faces,
                              }
                          );

                      }
                  }
              }
              rawMTLFile.send(null);
          }
      }
  }
  rawFile.send(null);
}


ObjLoader.prototype.createReadStream = function(fileString) {
  var readable = new stream.Readable();
  readable._read = function noop() {};
  readable.push(fileString);
  readable.push(null);
  return readable;
}


ObjLoader.prototype.parseObj = function(line) {

  /*Not include comment*/
  var commentStart = line.indexOf("#");
  if(commentStart != -1) {
    line = line.substring(0, commentStart);
  }
  line = line.trim();

  var splitedLine = line.split(/\s+/);

  if(splitedLine[0] === 'v') {
    var vertex = [Number(splitedLine[1]), Number(splitedLine[2]), Number(splitedLine[3]), splitedLine[4]? 1 : Number(splitedLine[4])];
    this.vertices.push(vertex);
  }
  else if(splitedLine[0] === 'vt') {
    var textureCoord = [Number(splitedLine[1]), Number(splitedLine[2]), splitedLine[3]? 1 : Number(splitedLine[3])]
    this.textureCoords.push(textureCoord);
  }
  else if(splitedLine[0] === 'vn') {
    var normal = [Number(splitedLine[1]), Number(splitedLine[2]), Number(splitedLine[3])];
    this.normals.push(normal);
  }
  else if(splitedLine[0] === 'f') {
    var face = {
      indices: [],
      texture: [],
      normal: []
      };

    for(var i = 1; i < splitedLine.length; ++i) {
      var dIndex = splitedLine[i].indexOf('//');
      var splitedFaceIndices = splitedLine[i].split(/\W+/);

      if(dIndex > 0) {
        /*Vertex Normal Indices Without Texture Coordinate Indices*/
        face.indices.push(splitedFaceIndices[0]);
        face.normal.push(splitedFaceIndices[1]);
      }
      else {
        if(splitedFaceIndices.length === 1) {
          /*Vertex Indices*/
          face.indices.push(splitedFaceIndices[0]);
        }
        else if(splitedFaceIndices.length === 2) {
          /*Vertex Texture Coordinate Indices*/
          face.indices.push(splitedFaceIndices[0]);
          face.texture.push(splitedFaceIndices[1]);
        }
        else if(splitedFaceIndices.length === 3) {
          /*Vertex Normal Indices*/
          face.indices.push(splitedFaceIndices[0]);
          face.texture.push(splitedFaceIndices[1]);
          face.normal.push(splitedFaceIndices[2]);
        }
      }
    }

    this.faces.push(face);
  }
  else if(splitedLine[0] === "usemtl") {
    if(this.faces.length === 0) {
      this.facesMaterialsIndex[0].materialName = splitedLine[1];
    }
    else {
      var materialName = splitedLine[1];
      var materialStartIndex = this.faces.length;

      this.facesMaterialsIndex.push({materialName: materialName, materialStartIndex: materialStartIndex});
    }
  }
}


ObjLoader.prototype.parseMtl = function(line, currentMat) {

  /*Not include comment*/
  var commentStart = line.indexOf("#");
  if(commentStart != -1) {
    line = line.substring(0, commentStart);
  }

  line = line.trim();
  var splitedLine = line.split(/\s+/);

  if(splitedLine[0] === "newmtl") {
    if(currentMat.name) {
      this.materials.push(currentMat);
      currentMat = {};
    }
    currentMat.name = splitedLine[1];
  }
  else if(splitedLine[0] === "Ka") {
    currentMat.ambient = [];
    for(var i = 0; i < 3; ++i) {
      currentMat.ambient.push(splitedLine[i+1]);
    }
  }
  else if(splitedLine[0] === "Kd") {
    currentMat.diffuse = [];
    for(var i = 0; i < 3; ++i) {
      currentMat.diffuse.push(splitedLine[i+1]);
    }
  }
  else if(splitedLine[0] === "Ks") {
    currentMat.specular = [];
    for(var i = 0; i < 3; ++i) {
      currentMat.specular.push(splitedLine[i+1]);
    }
  }
  else if(splitedLine[0] === "Ns") {
    currentMat.specularExponent = splitedLine[1];
  }
  else if(splitedLine[0] === "d" || splitedLine[0] === "Tr") {
    currentMat.transparent = splitedLine[1];
  }
  else if(splitedLine[0] === "illum") {
    currentMat.illumMode = splitedLine[1];
  }
  else if(splitedLine[0] === "map_Ka") {
    currentMat.ambientMap = splitedLine[1];
  }
  else if(splitedLine[0] === "map_Kd") {
    currentMat.diffuseMap = splitedLine[1];
  }
  else if(splitedLine[0] === "map_Ks") {
    currentMat.specularMap = splitedLine[1];
  }
  else if(splitedLine[0] === "map_d") {
    currentMat.alphaMat = splitedLine[1];
  }
  else if(splitedLine[0] === "map_bump" || splitedLine[0] === "bump") {
    currentMat.bumpMap = splitedLine[1];
  }
  else if(splitedLine[0] === "disp") {
    currentMat.displacementMap = splitedLine[1];
  }

  return currentMat;
}


//module.exports = ObjLoader;
