<script>
  export let title = "Wretched and Alone Game";
</script>

<style>
  /* Base layout styles */
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: sans-serif;
  }

  /* Container styles */
  .container {
    max-width: 800px;
    width: 100%;
    padding: 2rem;
    box-sizing: border-box;
  }
</style>

<main class="container">
  <h1>{title}</h1>
  <slot>
    
  </slot>
</main>
