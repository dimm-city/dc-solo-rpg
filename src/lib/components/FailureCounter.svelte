<script>
	export let failureCounter = 0; // Failure counter value
	const maxCounter = 100; // Maximum failure counter value

	// Calculate the percentage of failure progress
	$: failureProgress = maxCounter - failureCounter;

	// Determine the fill color based on the failure counter value
	$: fillColor = failureCounter < 50 ? '#FF0000' : '#00FF00';
</script>

<h4>Failure Meter</h4>
<div class="progress-bar">
	<div class="fill" style="width: {failureProgress}%; background-color: {fillColor}" />
    <span>{failureProgress}%</span>
</div>

<!-- <script>
  export let health = 100; // Current health of the tower
</script>

<style>
  /* Component styles go here */
  .tower {
    width: 80px;
    height: 200px;
  }

  .block {
    fill: #00ff00;
    transition: fill 0.3s ease;
  }

  .block.danger {
    fill: #ff0000;
    animation: damageAnimation 0.5s infinite alternate;
  }

  @keyframes damageAnimation {
    0% {
      fill: #ff0000;
    }
    50% {
      fill: #ffcccc;
    }
    100% {
      fill: #ff0000;
    }
  }
</style>

<svg class="tower" viewBox="0 0 80 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="80" height="200" fill="#333333" />
  {#each Array(Math.ceil(health / 10)) as _, index}
    <rect
      x="10"
      y={index * 20}
      width="60"
      height="10"
      class="block"
      class:danger={health <= index * 40}
    />
  {/each}
</svg> -->

<!-- <script>
	export let health = 100; // Current health of the tower

	let totalHeight = 200;
	let top;
	let bottom;

	$: if(top && bottom) {
		const bottomHeight = (health / 100) * totalHeight;
		const topHeight = totalHeight - bottomHeight;
		const clipPathInset = `inset(0 0 ${bottomHeight}px 0)`;
		top.style.fill = '#00ff00';
		bottom.style.fill = '#ff0000';
		bottom.style.clipPath = `clip-path: ${clipPathInset}`;
	}
</script>

<svg class="tower" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
	<polygon bind:this={top} points="0,0 100,0 60,100 100,200 0,200 40,100" class="hourglass" />
	<polygon
		bind:this={bottom}
		points="40,100 60,100 40,200 60,200"
		class="hourglass bottom"
		style="clip-path: inset(0 0 50% 0);"
	/>
</svg>

<style>
	/* Component styles go here */
	.tower {
		width: 100px;
		height: 200px;
		position: relative;
	}

	.hourglass {
		fill: #00ff00;
		transition: fill 0.3s ease;
	}

	.hourglass.bottom {
		fill: #ff0000;
		transition: fill 0.3s ease;
	}
</style> -->

<style>
	h4{
        margin-block: var(--dc-header-block-margin);
    }
	.progress-bar {
        position: relative;
		width: 100%;
		height: 1rem;
		background-color: #eeeeee;
		border-radius: 10px;
		overflow: hidden;
	}

    .progress-bar span{
        position: absolute;
        /* width: 100%;
        text-align: center; */
        top: 0;
    }
	.fill {
		height: 100%;
		opacity: 1;
		transition: all 0.3s ease;
		transform-origin: bottom;
	}
</style>
