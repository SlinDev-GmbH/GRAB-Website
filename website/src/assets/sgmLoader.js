import * as THREE from 'three';

class SGMLoader extends THREE.Loader {
  constructor(manager) {
    super(manager);
  }
  

  load(file, onLoad, onError, scene) {
    const loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);

    loader.load(
      '../../public/'+file+'.sgm',
      (data) => {
        try {
          const result = this.parse(data);
          const group = this.createGroupFromMeshes(result[0], result[1], file, scene);
          onLoad(group);
        } catch (error) {
          if (onError) {
            onError(error);
          } else {
            console.error(error);
          }
          this.manager.itemError('../../public'+file);
        }
      }
    );
  }

  parse(data) {
    const bufferView = new DataView(data);
    let offset = 0;

    function readUInt8() {
      let value = bufferView.getUint8(offset, true);
      offset += 1;
      return value;
    }

    function readUInt16() {
      let value = bufferView.getUint16(offset, true);
      offset += 2;
      return value;
    }

    function readUInt32() {
      let value = bufferView.getUint32(offset, true);
      offset += 4;
      return value;
    }

    function readFloat32() {
      let value = bufferView.getFloat32(offset, true);
      offset += 4;
      return value;
    }

    function readFloat32Array(count) {
      const result = new Array(count);
      for (let i = 0; i < count; i++) {
        result[i] = readFloat32();
      }
      return result;
    }

    function readBytes(count) {
      const bytes = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        bytes[i] = readUInt8();
      }
      return bytes;
    }

    function readString() {
      var text = "";
      var val = -1;

      const length = readUInt16() - 1;
      for (let i = 0; i < length; i++) {
        val = readUInt8();
        text += String.fromCharCode(val);
      }

      readBytes(1); // skip null terminator
      return text;
    }

    const version = [readUInt32(), readUInt8()];

    const numMaterials = readUInt8();
    const materials = [];
    for (let i = 0; i < numMaterials; i++) {
      const materialId = readUInt8();
      const uvCount = readUInt8();

      const uvData = [];
      for (let j = 0; j < uvCount; j++) {
        const imageCount = readUInt8();
        const images = [];
        for (let k = 0; k < imageCount; k++) {
          const usageHint = readUInt8();
          const texname = readString().replace('*', 'png');
          console.log(texname)
          images.push([texname, usageHint]);
        }
        uvData.push(images);
      }
      const colorCount = readUInt8();
      const colors = [];
      for (let j = 0; j < colorCount; j++) {
        const colorId = readUInt8();
        const color = readFloat32Array(4);
        colors.push([color, colorId]);
      }
      materials.push({
        material_id: materialId,
        uv_data: uvData,
        colors: colors,
      });
    }

    const numMeshes = readUInt8();
    const meshes = [];
    let indexOffset = 0; // for multiple meshes
    for (let i = 0; i < numMeshes; i++) {
      const vertices = [];
      const indices = [];
      const meshId = readUInt8();
      const materialId = readUInt8();
      const vertexCount = readUInt32();
      const uvCount = readUInt8();
      const texdataCount = readUInt8();
      const hasTangents = readUInt8();
      const hasBones = readUInt8();
      for (let j = 0; j < vertexCount; j++) {
        const position = readFloat32Array(3);
        const normal = readFloat32Array(3);
        const uvs = [];
        for (let k = 0; k < uvCount; k++) {
          const uv = readFloat32Array(2);
          uvs.push(uv);
        }
        const color = texdataCount === 4 ? readFloat32Array(4) : null;
        const tangent = hasTangents ? readFloat32Array(4) : null;
        const weights = hasBones ? readFloat32Array(4) : null;
        const bones = hasBones ? readFloat32Array(4) : null;
        vertices.push([position, normal, uvs, color, tangent, weights, bones]);
      }

      const indexCount = readUInt32();
      const indexSize = readUInt8();
      for (let j = 0; j < indexCount; j++) {
        const index = indexSize === 4 ? readUInt32() : readUInt16();
        indices.push(index);
      }

      indexOffset += vertices.length;
      meshes.push({
        mesh_id: meshId,
        material_id: materialId,
        vertices: vertices,
        indices: indices,
      });
    }

    return [meshes, materials];
  }

  createGroupFromMeshes(meshes, materials) {
    let group = new THREE.Group();

    const threeMaterials = materials.map((material) => {
        // Check if colors array is defined and has at least one element
        let color = (material.colors && material.colors.length > 0) ? material.colors[0][0] : [1, 1, 1]; // Default to white

        const matOptions = {
            color: new THREE.Color(color[0], color[1], color[2]),
        };
        return new THREE.MeshStandardMaterial(matOptions);
    });

    meshes.forEach((mesh) => {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const normals = [];
        const uvs = [];

        mesh.vertices.forEach((vertex) => {
            positions.push(...vertex[0]);
            normals.push(...vertex[1]);
            if (vertex[2].length > 0) {
                uvs.push(...vertex[2][0]);
            }
        });
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(new THREE.Uint32BufferAttribute(mesh.indices, 1));
        const threeMesh = new THREE.Mesh(geometry, threeMaterials[mesh.material_id]);
        group.add(threeMesh);
    });
    return group;
}

}

export { SGMLoader };
