<!DOCTYPE html>
<html lang="pt-BR">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

/* =====================================================
   RESET
===================================================== */

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  width: 100%;
  min-height: 100%;
}

body {
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  background:
    radial-gradient(
      circle at 50% 45%,
      #ffffff 0%,
      #eeeeee 55%,
      #d8d8d8 100%
    );
}


/* =====================================================
   GRAVATA
===================================================== */

.tie {
  position: relative;

  width: 140px;
  height: 540px;

  filter:
    drop-shadow(
      5px 9px 8px rgba(0, 0, 0, 0.24)
    );
}


/* =====================================================
   NÓ DA GRAVATA
===================================================== */

.tie-knot {
  position: absolute;

  top: 0;
  left: 50%;

  width: 78px;
  height: 96px;

  transform: translateX(-50%);

  background:

    /* iluminação */
    linear-gradient(
      90deg,
      rgba(0,0,0,.30) 0%,
      rgba(255,255,255,.09) 30%,
      rgba(255,255,255,.02) 50%,
      rgba(0,0,0,.20) 100%
    ),

    /* listras */
    repeating-linear-gradient(
      135deg,

      #071633 0px,
      #071633 28px,

      #dfa72b 28px,
      #dfa72b 35px,

      #071633 35px,
      #071633 63px
    );

  clip-path: polygon(

    18% 0%,
    82% 0%,

    95% 18%,

    84% 55%,

    70% 100%,
    50% 88%,
    30% 100%,

    16% 55%,

    5% 18%
  );

  z-index: 5;

  box-shadow:
    inset 8px 0 12px rgba(255,255,255,.08),
    inset -9px 0 14px rgba(0,0,0,.32);
}


/* =====================================================
   VINCO DO NÓ
===================================================== */

.tie-knot::after {

  content: "";

  position: absolute;

  top: 8px;
  left: 50%;

  width: 2px;
  height: 72px;

  transform: translateX(-50%);

  background:
    linear-gradient(
      to bottom,
      rgba(255,255,255,.13),
      rgba(255,255,255,0)
    );

  opacity: .5;
}


/* =====================================================
   CORPO DA GRAVATA
===================================================== */

.tie-body {

  position: absolute;

  top: 76px;
  left: 50%;

  width: 88px;
  height: 450px;

  transform: translateX(-50%);

  background:

    /* volume */
    linear-gradient(
      90deg,
      rgba(0,0,0,.32) 0%,
      rgba(255,255,255,.07) 30%,
      rgba(255,255,255,.02) 50%,
      rgba(0,0,0,.20) 100%
    ),

    /* listras */
    repeating-linear-gradient(
      135deg,

      #071633 0px,
      #071633 32px,

      #dda52a 32px,
      #dda52a 38px,

      #071633 38px,
      #071633 74px
    );

  /*
     Formato mais fino na ponta
  */

  clip-path: polygon(

    /* topo */
    30% 0%,
    70% 0%,

    /* lateral direita */
    73% 25%,
    75% 50%,
    78% 75%,

    /* ponta */
    86% 92%,
    50% 100%,
    14% 92%,

    /* lateral esquerda */
    22% 75%,
    25% 50%,
    27% 25%
  );

  z-index: 3;

  box-shadow:

    inset 8px 0 14px
      rgba(255,255,255,.07),

    inset -10px 0 16px
      rgba(0,0,0,.34);
}


/* =====================================================
   TEXTURA DO TECIDO
===================================================== */

.tie-body::before {

  content: "";

  position: absolute;

  inset: 0;

  background:

    /* textura vertical */
    repeating-linear-gradient(
      90deg,

      rgba(255,255,255,.025) 0px,
      rgba(255,255,255,.025) 1px,

      transparent 1px,
      transparent 3px
    ),

    /* brilho */
    linear-gradient(
      90deg,

      transparent 0%,

      rgba(255,255,255,.08) 30%,

      rgba(255,255,255,.025) 48%,

      transparent 72%
    );

  opacity: .65;

  pointer-events: none;
}


/* =====================================================
   LUZ CENTRAL
===================================================== */

.tie-body::after {

  content: "";

  position: absolute;

  top: 0;
  left: 50%;

  width: 28px;
  height: 100%;

  transform: translateX(-50%);

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.025),
      transparent
    );

  pointer-events: none;
}


/* =====================================================
   RESPONSIVO
===================================================== */

@media (max-width: 600px) {

  .tie {
    transform: scale(.82);
  }

}

</style>

</head>


<body>

<div class="tie">

  <div class="tie-knot"></div>

  <div class="tie-body"></div>

</div>

</body>
</html>