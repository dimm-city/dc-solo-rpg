<style>
  :root{
    --dc-accent-color: purple;
    --dc-toolbar-height: 3rem;
    --dc-header-block-margin: 0.25rem;
  }
   .container {
    display: grid;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
</style>

<link rel="stylesheet" href="WAAStyles.css">
<main class="container">  
  <slot>    
  </slot>
</main>
