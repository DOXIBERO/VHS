import * as THREE from 'three';

export class WordDisplay3D {
  static createTextSprite(text, subtext = '', bgColor = '#223355', textColor = '#FFFFFF') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Background pill with rounded corners
    ctx.fillStyle = bgColor;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(10, 10, 492, 236, 36);
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    } else {
      ctx.fillRect(10, 10, 492, 236);
    }

    // Main German Word Text
    ctx.font = '900 80px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Bold dark shadow/stroke
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(text, 256, subtext ? 105 : 128);

    ctx.fillStyle = textColor;
    ctx.fillText(text, 256, subtext ? 105 : 128);

    // Subtext / emoji if present
    if (subtext) {
      ctx.font = 'bold 44px sans-serif';
      ctx.fillStyle = '#FFE600';
      ctx.fillText(subtext, 256, 185);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(4.8, 2.4, 1);

    return sprite;
  }
}
