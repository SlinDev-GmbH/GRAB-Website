varying vec3 vWorldPosition;
varying vec3 vInitialWorldPosition;
varying vec3 vNormal;

uniform mat4 worldMatrix;
uniform mat3 worldNormalMatrix;

void main()
{
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec4 initialWorldPosition = worldMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vInitialWorldPosition = initialWorldPosition.xyz;

    vNormal = worldNormalMatrix * normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
