/**
 * Enxoval+ — interactive low-poly room scenes (Three.js r128)
 * Drag / touch to orbit · tabs to switch environments
 */
(function () {
  'use strict';

  var canvas = document.getElementById('scene-canvas');
  var wrap = document.getElementById('scene-canvas-wrap');
  var fallback = document.getElementById('scene-fallback');
  var hint = document.getElementById('scene-hint');
  var legendRoom = document.getElementById('legend-room');
  var legendProps = document.getElementById('legend-props');
  var tabs = document.querySelectorAll('.scene-tab');

  if (!canvas || !wrap) return;

  var ROOM_META = {
    bebe: {
      title: 'Quarto do bebê',
      props: [
        { color: '#7EC4B8', label: 'Berço' },
        { color: '#F5C6B8', label: 'Mobile' },
        { color: '#E8D5B7', label: 'Cômoda' }
      ],
      theme: 'mint'
    },
    banho: {
      title: 'Banho / higiene',
      props: [
        { color: '#7EB0D8', label: 'Banheira' },
        { color: '#F5D0C8', label: 'Toalhas' },
        { color: '#C8E6E0', label: 'Trocador' }
      ],
      theme: 'sky'
    },
    casal: {
      title: 'Quarto de casal',
      props: [
        { color: '#E8B4A8', label: 'Cama' },
        { color: '#F5D0C8', label: 'Travesseiros' },
        { color: '#D4B07A', label: 'Criado-mudo' }
      ],
      theme: 'blush'
    },
    cozinha: {
      title: 'Cozinha',
      props: [
        { color: '#D4785C', label: 'Panelas' },
        { color: '#C4A574', label: 'Armário' },
        { color: '#E8C4A8', label: 'Bancada' }
      ],
      theme: 'peach'
    }
  };

  function roomFromUrl() {
    try {
      var r = new URLSearchParams(window.location.search).get('ambiente');
      return r && ROOM_META[r] ? r : null;
    } catch (e) {
      return null;
    }
  }

  function showFallback() {
    if (wrap) wrap.hidden = true;
    if (fallback) fallback.hidden = false;
    if (hint) hint.hidden = true;
  }

  function updateLegend(roomId) {
    var meta = ROOM_META[roomId];
    if (!meta) return;
    if (legendRoom) legendRoom.textContent = meta.title;
    if (legendProps) {
      legendProps.innerHTML = meta.props.map(function (p) {
        return '<li><span class="prop-swatch" style="background:' + p.color + '"></span> ' + p.label + '</li>';
      }).join('');
    }
  }

  // --- WebGL check ---
  if (typeof THREE === 'undefined') {
    showFallback();
    updateLegend(roomFromUrl() || 'bebe');
    return;
  }

  var glOk = false;
  try {
    var test = document.createElement('canvas');
    glOk = !!(test.getContext('webgl') || test.getContext('experimental-webgl'));
  } catch (e) {
    glOk = false;
  }
  if (!glOk) {
    showFallback();
    updateLegend(roomFromUrl() || 'bebe');
    return;
  }

  // --- Scene setup ---
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  if (renderer.outputEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(5.2, 3.6, 5.8);

  // Lights
  var ambient = new THREE.AmbientLight(0xfff5ef, 0.75);
  scene.add(ambient);
  var key = new THREE.DirectionalLight(0xffffff, 0.65);
  key.position.set(4, 8, 3);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xffd0c8, 0.35);
  fill.position.set(-4, 3, -2);
  scene.add(fill);
  var rim = new THREE.PointLight(0xa8d8cf, 0.4, 20);
  rim.position.set(0, 4, -3);
  scene.add(rim);

  var roomRoot = new THREE.Group();
  scene.add(roomRoot);

  // --- Helpers ---
  function mat(hex, opts) {
    opts = opts || {};
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex),
      roughness: opts.roughness != null ? opts.roughness : 0.72,
      metalness: opts.metalness != null ? opts.metalness : 0.05,
      flatShading: true
    });
  }

  function box(w, h, d, hex, x, y, z, opts) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex, opts));
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }

  function cyl(rTop, rBot, h, hex, x, y, z, segs) {
    var m = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBot, h, segs || 10),
      mat(hex)
    );
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }

  function sphere(r, hex, x, y, z) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat(hex, { roughness: 0.55 }));
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }

  function makeFloor(hex) {
    var g = new THREE.Group();
    g.add(box(8, 0.12, 8, hex, 0, -0.06, 0));
    // soft rug
    g.add(box(3.2, 0.04, 2.4, '#FFFFFF', 0, 0.02, 0.4, { roughness: 0.9 }));
    return g;
  }

  function makeWalls(backHex, sideHex) {
    var g = new THREE.Group();
    // back
    g.add(box(8, 4.2, 0.12, backHex, 0, 2.1, -4));
    // left
    g.add(box(0.12, 4.2, 8, sideHex, -4, 2.1, 0));
    // right (slightly open feel — shorter)
    g.add(box(0.12, 4.2, 5, sideHex, 4, 2.1, -1.5));
    return g;
  }

  function makeLabelSprite(text, color) {
    var c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 256, 64);
    // pill bg
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    roundRect(ctx, 16, 10, 224, 44, 22);
    ctx.fill();
    ctx.strokeStyle = color || '#d4705a';
    ctx.lineWidth = 3;
    roundRect(ctx, 16, 10, 224, 44, 22);
    ctx.stroke();
    ctx.fillStyle = '#3a2f2a';
    ctx.font = 'bold 26px Nunito, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 33);
    var tex = new THREE.CanvasTexture(c);
    var sprMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var spr = new THREE.Sprite(sprMat);
    spr.scale.set(1.6, 0.4, 1);
    return spr;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // --- Rooms ---
  function buildBebe() {
    var g = new THREE.Group();
    g.add(makeFloor('#E8F6F2'));
    g.add(makeWalls('#D8EFE9', '#F5EDE6'));

    // crib
    var crib = new THREE.Group();
    crib.add(box(2.2, 0.15, 1.2, '#7EC4B8', 0, 0.55, 0));
    crib.add(box(2.2, 0.9, 0.1, '#A8D8CF', 0, 1.0, -0.55));
    crib.add(box(2.2, 0.9, 0.1, '#A8D8CF', 0, 1.0, 0.55));
    crib.add(box(0.1, 0.9, 1.2, '#A8D8CF', -1.05, 1.0, 0));
    crib.add(box(0.1, 0.9, 1.2, '#A8D8CF', 1.05, 1.0, 0));
    // mattress + pillow
    crib.add(box(1.9, 0.18, 0.95, '#FFFFFF', 0, 0.72, 0));
    crib.add(box(0.55, 0.12, 0.4, '#F5C6B8', -0.5, 0.88, 0));
    // legs
    [[-1, -0.5], [1, -0.5], [-1, 0.5], [1, 0.5]].forEach(function (p) {
      crib.add(cyl(0.06, 0.06, 0.5, '#5A9E90', p[0], 0.25, p[1], 8));
    });
    crib.position.set(-0.8, 0, -0.5);
    g.add(crib);
    var cribLabel = makeLabelSprite('Berço', '#7EC4B8');
    cribLabel.position.set(-0.8, 2.15, -0.5);
    g.add(cribLabel);

    // mobile above crib
    var mobile = new THREE.Group();
    mobile.add(cyl(0.03, 0.03, 0.8, '#C4A574', 0, 0.4, 0, 6));
    mobile.add(box(1.2, 0.05, 0.05, '#E8D5B7', 0, 0, 0));
    mobile.add(sphere(0.12, '#F5C6B8', -0.55, -0.2, 0));
    mobile.add(sphere(0.12, '#7EC4B8', 0.55, -0.15, 0));
    mobile.add(sphere(0.1, '#D4B07A', 0, -0.25, 0));
    mobile.position.set(-0.8, 2.6, -0.5);
    g.add(mobile);
    var mobLabel = makeLabelSprite('Mobile', '#F5C6B8');
    mobLabel.position.set(-0.8, 3.35, -0.5);
    g.add(mobLabel);

    // dresser
    var dresser = box(1.6, 1.1, 0.7, '#E8D5B7', 2.2, 0.55, -2.8);
    g.add(dresser);
    g.add(box(1.4, 0.08, 0.55, '#D4B07A', 2.2, 0.85, -2.8));
    g.add(box(1.4, 0.08, 0.55, '#D4B07A', 2.2, 0.45, -2.8));
    var drLabel = makeLabelSprite('Cômoda', '#E8D5B7');
    drLabel.position.set(2.2, 1.5, -2.8);
    g.add(drLabel);

    // window glow
    g.add(box(1.8, 1.4, 0.08, '#FFF8E8', -2.5, 2.4, -3.92));

    return g;
  }

  function buildBanho() {
    var g = new THREE.Group();
    g.add(makeFloor('#E8F2FA'));
    g.add(makeWalls('#D6E8F5', '#F5EDE6'));

    // bathtub
    var tub = new THREE.Group();
    tub.add(box(2.4, 0.55, 1.3, '#7EB0D8', 0, 0.35, 0));
    tub.add(box(2.1, 0.35, 1.0, '#A8C8E8', 0, 0.55, 0, { roughness: 0.4 }));
    // water
    tub.add(box(1.9, 0.08, 0.85, '#C8E0F5', 0, 0.62, 0, { roughness: 0.2, metalness: 0.15 }));
    tub.position.set(-0.5, 0, 0.2);
    g.add(tub);
    var tubLabel = makeLabelSprite('Banheira', '#7EB0D8');
    tubLabel.position.set(-0.5, 1.35, 0.2);
    g.add(tubLabel);

    // towel rack + towels
    g.add(box(0.08, 1.4, 0.08, '#C4A574', 2.4, 1.5, -2.5));
    g.add(box(0.7, 1.0, 0.15, '#F5D0C8', 2.4, 1.3, -2.5));
    g.add(box(0.65, 0.9, 0.12, '#E8B4A8', 2.55, 1.25, -2.35));
    var towLabel = makeLabelSprite('Toalhas', '#F5D0C8');
    towLabel.position.set(2.4, 2.35, -2.5);
    g.add(towLabel);

    // changing table
    var changer = new THREE.Group();
    changer.add(box(1.5, 0.9, 0.7, '#C8E6E0', 0, 0.45, 0));
    changer.add(box(1.55, 0.1, 0.75, '#A8D8CF', 0, 0.95, 0));
    changer.add(box(0.9, 0.12, 0.45, '#FFFFFF', 0, 1.08, 0));
    changer.position.set(-2.2, 0, -2.6);
    g.add(changer);
    var chLabel = makeLabelSprite('Trocador', '#C8E6E0');
    chLabel.position.set(-2.2, 1.55, -2.6);
    g.add(chLabel);

    // small plant
    g.add(cyl(0.15, 0.2, 0.25, '#E8C4A8', 2.5, 0.15, 1.5, 8));
    g.add(sphere(0.28, '#6FA89A', 2.5, 0.5, 1.5));

    return g;
  }

  function buildCasal() {
    var g = new THREE.Group();
    g.add(makeFloor('#FBF0EC'));
    g.add(makeWalls('#F7E0D8', '#F5EDE6'));

    // bed
    var bed = new THREE.Group();
    bed.add(box(2.8, 0.45, 2.0, '#C4A574', 0, 0.35, 0)); // frame
    bed.add(box(2.7, 0.35, 1.9, '#E8B4A8', 0, 0.7, 0)); // mattress
    bed.add(box(2.7, 0.12, 1.9, '#F5D0C8', 0, 0.92, 0)); // sheet
    // pillows
    bed.add(box(0.85, 0.22, 0.55, '#FFFFFF', -0.7, 1.1, -0.55));
    bed.add(box(0.85, 0.22, 0.55, '#FFFFFF', 0.7, 1.1, -0.55));
    // headboard
    bed.add(box(2.9, 1.1, 0.12, '#D4A090', 0, 1.15, -1.0));
    bed.position.set(0, 0, -0.3);
    g.add(bed);
    var bedLabel = makeLabelSprite('Cama', '#E8B4A8');
    bedLabel.position.set(0, 2.0, -0.3);
    g.add(bedLabel);

    var pillowLabel = makeLabelSprite('Travesseiros', '#F5D0C8');
    pillowLabel.position.set(0, 1.55, -1.0);
    g.add(pillowLabel);

    // nightstands
    g.add(box(0.7, 0.55, 0.55, '#D4B07A', -2.1, 0.3, -1.1));
    g.add(box(0.7, 0.55, 0.55, '#D4B07A', 2.1, 0.3, -1.1));
    g.add(cyl(0.08, 0.12, 0.35, '#E8D5B7', -2.1, 0.75, -1.1, 8));
    g.add(sphere(0.14, '#FFF8E8', -2.1, 1.0, -1.1));
    var nsLabel = makeLabelSprite('Criado-mudo', '#D4B07A');
    nsLabel.position.set(-2.1, 1.35, -1.1);
    g.add(nsLabel);

    // soft lamp glow orb
    g.add(sphere(0.25, '#FFE8C8', 2.1, 1.0, -1.1));

    return g;
  }

  function buildCozinha() {
    var g = new THREE.Group();
    g.add(makeFloor('#FFF5EB'));
    g.add(makeWalls('#F5E8DA', '#F5EDE6'));

    // counter
    g.add(box(5.5, 1.0, 1.0, '#E8C4A8', 0, 0.5, -2.8));
    g.add(box(5.6, 0.08, 1.1, '#D4B07A', 0, 1.04, -2.8));
    var bancLabel = makeLabelSprite('Bancada', '#E8C4A8');
    bancLabel.position.set(-1.5, 1.55, -2.8);
    g.add(bancLabel);

    // cabinets
    g.add(box(1.8, 1.6, 0.7, '#C4A574', -2.4, 2.4, -3.0));
    g.add(box(1.8, 1.6, 0.7, '#C4A574', 2.4, 2.4, -3.0));
    var armLabel = makeLabelSprite('Armário', '#C4A574');
    armLabel.position.set(-2.4, 3.45, -3.0);
    g.add(armLabel);

    // stove + pans
    g.add(box(1.4, 1.0, 0.9, '#8a7a6e', 0.8, 0.5, -2.7));
    g.add(box(1.35, 0.05, 0.85, '#5a5048', 0.8, 1.04, -2.7));
    // burners
    g.add(cyl(0.18, 0.18, 0.04, '#3a3430', 0.5, 1.08, -2.55, 10));
    g.add(cyl(0.18, 0.18, 0.04, '#3a3430', 1.1, 1.08, -2.55, 10));

    // pans
    var pan1 = new THREE.Group();
    pan1.add(cyl(0.35, 0.32, 0.18, '#D4785C', 0, 0.1, 0, 12));
    pan1.add(box(0.5, 0.05, 0.08, '#8a6a4a', 0.5, 0.12, 0));
    pan1.position.set(0.5, 1.12, -2.55);
    g.add(pan1);

    var pan2 = new THREE.Group();
    pan2.add(cyl(0.4, 0.36, 0.22, '#c45c3e', 0, 0.12, 0, 12));
    pan2.add(box(0.55, 0.05, 0.08, '#8a6a4a', 0.55, 0.14, 0));
    pan2.position.set(-1.2, 1.12, -2.55);
    g.add(pan2);

    var panLabel = makeLabelSprite('Panelas', '#D4785C');
    panLabel.position.set(0.5, 1.7, -2.2);
    g.add(panLabel);

    // island / table
    g.add(box(2.0, 0.9, 1.2, '#E8D5B7', 0.3, 0.45, 1.2));
    g.add(box(2.1, 0.08, 1.3, '#D4B07A', 0.3, 0.94, 1.2));

    // fruit bowl
    g.add(cyl(0.3, 0.22, 0.15, '#F5D0C8', 0.3, 1.05, 1.2, 10));
    g.add(sphere(0.1, '#E07A64', 0.2, 1.2, 1.15));
    g.add(sphere(0.09, '#D4B07A', 0.4, 1.18, 1.25));

    return g;
  }

  var builders = {
    bebe: buildBebe,
    banho: buildBanho,
    casal: buildCasal,
    cozinha: buildCozinha
  };

  var currentRoom = 'bebe';
  var currentGroup = null;

  function loadRoom(id) {
    if (!builders[id]) return;
    if (currentGroup) {
      roomRoot.remove(currentGroup);
      disposeGroup(currentGroup);
      currentGroup = null;
    }
    currentRoom = id;
    currentGroup = builders[id]();
    roomRoot.add(currentGroup);
    updateLegend(id);

    // gentle reset orbit target feel
    targetTheta = 0.55;
    targetPhi = 1.05;
  }

  function disposeGroup(group) {
    group.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
  }

  // --- Orbit controls (custom, touch + mouse) ---
  var isDragging = false;
  var lastX = 0;
  var lastY = 0;
  var theta = 0.55; // horizontal
  var phi = 1.05;   // vertical
  var targetTheta = 0.55;
  var targetPhi = 1.05;
  var radius = 8.2;
  var lookAt = new THREE.Vector3(0, 1.2, -0.5);

  function applyCamera() {
    var x = lookAt.x + radius * Math.sin(phi) * Math.sin(theta);
    var y = lookAt.y + radius * Math.cos(phi);
    var z = lookAt.z + radius * Math.sin(phi) * Math.cos(theta);
    camera.position.set(x, y, z);
    camera.lookAt(lookAt);
  }

  function onPointerDown(e) {
    isDragging = true;
    var p = e.touches ? e.touches[0] : e;
    lastX = p.clientX;
    lastY = p.clientY;
    if (hint) hint.style.opacity = '0';
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    var p = e.touches ? e.touches[0] : e;
    var dx = p.clientX - lastX;
    var dy = p.clientY - lastY;
    lastX = p.clientX;
    lastY = p.clientY;
    targetTheta -= dx * 0.008;
    targetPhi -= dy * 0.006;
    targetPhi = Math.max(0.35, Math.min(1.35, targetPhi));
    if (e.cancelable) e.preventDefault();
  }

  function onPointerUp() {
    isDragging = false;
  }

  wrap.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  wrap.addEventListener('touchstart', onPointerDown, { passive: true });
  wrap.addEventListener('touchmove', onPointerMove, { passive: false });
  wrap.addEventListener('touchend', onPointerUp);
  wrap.addEventListener('touchcancel', onPointerUp);

  // wheel zoom
  wrap.addEventListener('wheel', function (e) {
    radius += e.deltaY * 0.01;
    radius = Math.max(5.5, Math.min(12, radius));
    e.preventDefault();
  }, { passive: false });

  // --- Tabs ---
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var room = tab.getAttribute('data-room');
      if (!room || room === currentRoom) return;
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      loadRoom(room);
      if (hint) {
        hint.style.opacity = '1';
        hint.textContent = 'Arraste para orbitar · ' + (ROOM_META[room] ? ROOM_META[room].title : '');
      }
    });
  });

  // --- Resize ---
  function resize() {
    var w = wrap.clientWidth || 640;
    var h = wrap.clientHeight || 360;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);
  resize();

  // --- Animate ---
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoSpin = !reduced;
  var lastAuto = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);
    // smooth orbit
    theta += (targetTheta - theta) * 0.12;
    phi += (targetPhi - phi) * 0.12;

    if (autoSpin && !isDragging) {
      var dt = Math.min(0.05, (now - lastAuto) / 1000);
      targetTheta += dt * 0.12;
    }
    lastAuto = now;

    // gentle bob of labels (non-accumulating)
    if (currentGroup && !reduced) {
      currentGroup.traverse(function (obj) {
        if (obj.isSprite) {
          if (obj.userData.baseY == null) obj.userData.baseY = obj.position.y;
          obj.position.y = obj.userData.baseY + Math.sin(now * 0.002 + obj.position.x) * 0.04;
        }
      });
    }

    applyCamera();
    renderer.render(scene, camera);
  }

  // Pause auto-spin when off-screen
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        autoSpin = en.isIntersecting && !reduced;
      });
    }, { threshold: 0.15 });
    io.observe(wrap);
  }

  loadRoom('bebe');
  var initialRoom = roomFromUrl();
  if (initialRoom && initialRoom !== 'bebe') {
    tabs.forEach(function (t) {
      if (t.getAttribute('data-room') === initialRoom) t.click();
    });
  }
  applyCamera();
  requestAnimationFrame(animate);

  // Hide hint after first interaction delay
  setTimeout(function () {
    if (hint && !isDragging) hint.style.transition = 'opacity 0.6s';
  }, 100);
})();
