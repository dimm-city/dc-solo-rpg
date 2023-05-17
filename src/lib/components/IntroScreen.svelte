<script>
	import { currentState, startGame } from './GameStore.js';
</script>

<div class="intro-container">
	<div class="content">
		<h2>Intro</h2>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla at luctus ante. Nunc non lorem
			sed tellus posuere placerat eget iaculis dolor. Nullam posuere mollis lobortis. Quisque et
			feugiat elit. Suspendisse in faucibus nulla. Phasellus ornare maximus velit. Donec rhoncus
			varius lacus eget lacinia.
		</p>
		<p>
			Duis semper molestie magna et laoreet. Vivamus arcu leo, cursus in massa a, pretium varius
			diam. Ut sed enim tellus. Mauris tincidunt lacinia mi, eget convallis nisi dictum a. Maecenas
			sollicitudin, dui vitae aliquam suscipit, metus risus vestibulum turpis, in malesuada libero
			libero at risus. Aenean felis ligula, porttitor eget ipsum ut, vestibulum semper nisl. Sed
			massa turpis, fermentum in nisi sit amet, euismod commodo mauris. Nulla facilisi. Aliquam
			ultricies libero ante, id semper leo dapibus at. Proin odio turpis, varius in fringilla eget,
			lacinia sit amet ex. Etiam facilisis congue mi, at varius urna semper ut. Aliquam sollicitudin
			nisl lorem, ut ultrices eros viverra eu.
		</p>
		<!-- <p>
			Mauris blandit tempor eros. Integer tincidunt elementum mollis. Class aptent taciti sociosqu
			ad litora torquent per conubia nostra, per inceptos himenaeos. In convallis ex et massa
			laoreet commodo. Etiam vitae ornare ligula. Nulla aliquet enim vel felis facilisis, a
			tristique lorem congue. Sed maximus elit turpis, sit amet lacinia tellus vulputate nec. Nulla
			consectetur risus orci. Nunc nec tellus est. Duis vitae fringilla eros, vitae elementum sem.
			Phasellus sed commodo massa. Nullam quis velit dapibus, vestibulum elit in, venenatis urna.
			Pellentesque ac nulla fermentum, tempor odio nec, tristique massa. Morbi sapien velit, laoreet
			sit amet tempor finibus, vehicula ac lorem. Phasellus quis dui vitae ligula tristique feugiat.
		</p>
		<p>
			Vivamus blandit nulla molestie, iaculis risus in, rhoncus magna. Aenean ut erat non enim
			venenatis dictum blandit ut purus. Sed eu elementum metus. Vestibulum at quam lorem. Nunc
			augue nisl, posuere nec sollicitudin id, mollis quis velit. Donec sodales quam et turpis
			sollicitudin commodo. Pellentesque habitant morbi tristique senectus et netus et malesuada
			fames ac turpis egestas. In eu tellus velit. In hac habitasse platea dictumst. Integer mattis
			massa gravida, interdum velit id, tempor justo. Fusce non nibh scelerisque, eleifend libero a,
			cursus neque. Pellentesque imperdiet, justo quis bibendum mattis, ligula risus commodo libero,
			in rutrum felis mi ac arcu. Duis rutrum porttitor velit non scelerisque. Sed feugiat sodales
			justo in imperdiet. Sed porta vitae lacus quis ultrices.
		</p>
		<p>
			Morbi faucibus eleifend auctor. Interdum et malesuada fames ac ante ipsum primis in faucibus.
			Integer gravida ullamcorper velit at fermentum. Duis ut imperdiet ipsum. Nunc eros erat,
			faucibus vitae nisi sed, euismod scelerisque lorem. Phasellus purus libero, mattis quis
			hendrerit ut, malesuada vitae odio. Mauris rutrum leo quis sapien cursus vehicula. Ut id
			sapien neque. Nunc tortor dolor, mattis a orci nec, elementum faucibus massa. Quisque eget
			egestas lectus. Sed dignissim urna vitae magna consectetur molestie. Ut facilisis consectetur
			magna, ut egestas erat vestibulum a. Phasellus faucibus nibh sed magna tempus, eget bibendum
			metus hendrerit.
		</p>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla at luctus ante. Nunc non lorem
			sed tellus posuere placerat eget iaculis dolor. Nullam posuere mollis lobortis. Quisque et
			feugiat elit. Suspendisse in faucibus nulla. Phasellus ornare maximus velit. Donec rhoncus
			varius lacus eget lacinia.
		</p>
		<p>
			Duis semper molestie magna et laoreet. Vivamus arcu leo, cursus in massa a, pretium varius
			diam. Ut sed enim tellus. Mauris tincidunt lacinia mi, eget convallis nisi dictum a. Maecenas
			sollicitudin, dui vitae aliquam suscipit, metus risus vestibulum turpis, in malesuada libero
			libero at risus. Aenean felis ligula, porttitor eget ipsum ut, vestibulum semper nisl. Sed
			massa turpis, fermentum in nisi sit amet, euismod commodo mauris. Nulla facilisi. Aliquam
			ultricies libero ante, id semper leo dapibus at. Proin odio turpis, varius in fringilla eget,
			lacinia sit amet ex. Etiam facilisis congue mi, at varius urna semper ut. Aliquam sollicitudin
			nisl lorem, ut ultrices eros viverra eu.
		</p>
		<p>
			Mauris blandit tempor eros. Integer tincidunt elementum mollis. Class aptent taciti sociosqu
			ad litora torquent per conubia nostra, per inceptos himenaeos. In convallis ex et massa
			laoreet commodo. Etiam vitae ornare ligula. Nulla aliquet enim vel felis facilisis, a
			tristique lorem congue. Sed maximus elit turpis, sit amet lacinia tellus vulputate nec. Nulla
			consectetur risus orci. Nunc nec tellus est. Duis vitae fringilla eros, vitae elementum sem.
			Phasellus sed commodo massa. Nullam quis velit dapibus, vestibulum elit in, venenatis urna.
			Pellentesque ac nulla fermentum, tempor odio nec, tristique massa. Morbi sapien velit, laoreet
			sit amet tempor finibus, vehicula ac lorem. Phasellus quis dui vitae ligula tristique feugiat.
		</p>
		<p>
			Vivamus blandit nulla molestie, iaculis risus in, rhoncus magna. Aenean ut erat non enim
			venenatis dictum blandit ut purus. Sed eu elementum metus. Vestibulum at quam lorem. Nunc
			augue nisl, posuere nec sollicitudin id, mollis quis velit. Donec sodales quam et turpis
			sollicitudin commodo. Pellentesque habitant morbi tristique senectus et netus et malesuada
			fames ac turpis egestas. In eu tellus velit. In hac habitasse platea dictumst. Integer mattis
			massa gravida, interdum velit id, tempor justo. Fusce non nibh scelerisque, eleifend libero a,
			cursus neque. Pellentesque imperdiet, justo quis bibendum mattis, ligula risus commodo libero,
			in rutrum felis mi ac arcu. Duis rutrum porttitor velit non scelerisque. Sed feugiat sodales
			justo in imperdiet. Sed porta vitae lacus quis ultrices.
		</p>
		<p>
			Morbi faucibus eleifend auctor. Interdum et malesuada fames ac ante ipsum primis in faucibus.
			Integer gravida ullamcorper velit at fermentum. Duis ut imperdiet ipsum. Nunc eros erat,
			faucibus vitae nisi sed, euismod scelerisque lorem. Phasellus purus libero, mattis quis
			hendrerit ut, malesuada vitae odio. Mauris rutrum leo quis sapien cursus vehicula. Ut id
			sapien neque. Nunc tortor dolor, mattis a orci nec, elementum faucibus massa. Quisque eget
			egestas lectus. Sed dignissim urna vitae magna consectetur molestie. Ut facilisis consectetur
			magna, ut egestas erat vestibulum a. Phasellus faucibus nibh sed magna tempus, eget bibendum
			metus hendrerit.
		</p>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla at luctus ante. Nunc non lorem
			sed tellus posuere placerat eget iaculis dolor. Nullam posuere mollis lobortis. Quisque et
			feugiat elit. Suspendisse in faucibus nulla. Phasellus ornare maximus velit. Donec rhoncus
			varius lacus eget lacinia.
		</p>
		<p>
			Duis semper molestie magna et laoreet. Vivamus arcu leo, cursus in massa a, pretium varius
			diam. Ut sed enim tellus. Mauris tincidunt lacinia mi, eget convallis nisi dictum a. Maecenas
			sollicitudin, dui vitae aliquam suscipit, metus risus vestibulum turpis, in malesuada libero
			libero at risus. Aenean felis ligula, porttitor eget ipsum ut, vestibulum semper nisl. Sed
			massa turpis, fermentum in nisi sit amet, euismod commodo mauris. Nulla facilisi. Aliquam
			ultricies libero ante, id semper leo dapibus at. Proin odio turpis, varius in fringilla eget,
			lacinia sit amet ex. Etiam facilisis congue mi, at varius urna semper ut. Aliquam sollicitudin
			nisl lorem, ut ultrices eros viverra eu.
		</p>
		<p>
			Mauris blandit tempor eros. Integer tincidunt elementum mollis. Class aptent taciti sociosqu
			ad litora torquent per conubia nostra, per inceptos himenaeos. In convallis ex et massa
			laoreet commodo. Etiam vitae ornare ligula. Nulla aliquet enim vel felis facilisis, a
			tristique lorem congue. Sed maximus elit turpis, sit amet lacinia tellus vulputate nec. Nulla
			consectetur risus orci. Nunc nec tellus est. Duis vitae fringilla eros, vitae elementum sem.
			Phasellus sed commodo massa. Nullam quis velit dapibus, vestibulum elit in, venenatis urna.
			Pellentesque ac nulla fermentum, tempor odio nec, tristique massa. Morbi sapien velit, laoreet
			sit amet tempor finibus, vehicula ac lorem. Phasellus quis dui vitae ligula tristique feugiat.
		</p>
		<p>
			Vivamus blandit nulla molestie, iaculis risus in, rhoncus magna. Aenean ut erat non enim
			venenatis dictum blandit ut purus. Sed eu elementum metus. Vestibulum at quam lorem. Nunc
			augue nisl, posuere nec sollicitudin id, mollis quis velit. Donec sodales quam et turpis
			sollicitudin commodo. Pellentesque habitant morbi tristique senectus et netus et malesuada
			fames ac turpis egestas. In eu tellus velit. In hac habitasse platea dictumst. Integer mattis
			massa gravida, interdum velit id, tempor justo. Fusce non nibh scelerisque, eleifend libero a,
			cursus neque. Pellentesque imperdiet, justo quis bibendum mattis, ligula risus commodo libero,
			in rutrum felis mi ac arcu. Duis rutrum porttitor velit non scelerisque. Sed feugiat sodales
			justo in imperdiet. Sed porta vitae lacus quis ultrices.
		</p>
		<p>
			Morbi faucibus eleifend auctor. Interdum et malesuada fames ac ante ipsum primis in faucibus.
			Integer gravida ullamcorper velit at fermentum. Duis ut imperdiet ipsum. Nunc eros erat,
			faucibus vitae nisi sed, euismod scelerisque lorem. Phasellus purus libero, mattis quis
			hendrerit ut, malesuada vitae odio. Mauris rutrum leo quis sapien cursus vehicula. Ut id
			sapien neque. Nunc tortor dolor, mattis a orci nec, elementum faucibus massa. Quisque eget
			egestas lectus. Sed dignissim urna vitae magna consectetur molestie. Ut facilisis consectetur
			magna, ut egestas erat vestibulum a. Phasellus faucibus nibh sed magna tempus, eget bibendum
			metus hendrerit.
		</p>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla at luctus ante. Nunc non lorem
			sed tellus posuere placerat eget iaculis dolor. Nullam posuere mollis lobortis. Quisque et
			feugiat elit. Suspendisse in faucibus nulla. Phasellus ornare maximus velit. Donec rhoncus
			varius lacus eget lacinia.
		</p>
		<p>
			Duis semper molestie magna et laoreet. Vivamus arcu leo, cursus in massa a, pretium varius
			diam. Ut sed enim tellus. Mauris tincidunt lacinia mi, eget convallis nisi dictum a. Maecenas
			sollicitudin, dui vitae aliquam suscipit, metus risus vestibulum turpis, in malesuada libero
			libero at risus. Aenean felis ligula, porttitor eget ipsum ut, vestibulum semper nisl. Sed
			massa turpis, fermentum in nisi sit amet, euismod commodo mauris. Nulla facilisi. Aliquam
			ultricies libero ante, id semper leo dapibus at. Proin odio turpis, varius in fringilla eget,
			lacinia sit amet ex. Etiam facilisis congue mi, at varius urna semper ut. Aliquam sollicitudin
			nisl lorem, ut ultrices eros viverra eu.
		</p>
		<p>
			Mauris blandit tempor eros. Integer tincidunt elementum mollis. Class aptent taciti sociosqu
			ad litora torquent per conubia nostra, per inceptos himenaeos. In convallis ex et massa
			laoreet commodo. Etiam vitae ornare ligula. Nulla aliquet enim vel felis facilisis, a
			tristique lorem congue. Sed maximus elit turpis, sit amet lacinia tellus vulputate nec. Nulla
			consectetur risus orci. Nunc nec tellus est. Duis vitae fringilla eros, vitae elementum sem.
			Phasellus sed commodo massa. Nullam quis velit dapibus, vestibulum elit in, venenatis urna.
			Pellentesque ac nulla fermentum, tempor odio nec, tristique massa. Morbi sapien velit, laoreet
			sit amet tempor finibus, vehicula ac lorem. Phasellus quis dui vitae ligula tristique feugiat.
		</p>
		<p>
			Vivamus blandit nulla molestie, iaculis risus in, rhoncus magna. Aenean ut erat non enim
			venenatis dictum blandit ut purus. Sed eu elementum metus. Vestibulum at quam lorem. Nunc
			augue nisl, posuere nec sollicitudin id, mollis quis velit. Donec sodales quam et turpis
			sollicitudin commodo. Pellentesque habitant morbi tristique senectus et netus et malesuada
			fames ac turpis egestas. In eu tellus velit. In hac habitasse platea dictumst. Integer mattis
			massa gravida, interdum velit id, tempor justo. Fusce non nibh scelerisque, eleifend libero a,
			cursus neque. Pellentesque imperdiet, justo quis bibendum mattis, ligula risus commodo libero,
			in rutrum felis mi ac arcu. Duis rutrum porttitor velit non scelerisque. Sed feugiat sodales
			justo in imperdiet. Sed porta vitae lacus quis ultrices.
		</p>
		<p>
			Morbi faucibus eleifend auctor. Interdum et malesuada fames ac ante ipsum primis in faucibus.
			Integer gravida ullamcorper velit at fermentum. Duis ut imperdiet ipsum. Nunc eros erat,
			faucibus vitae nisi sed, euismod scelerisque lorem. Phasellus purus libero, mattis quis
			hendrerit ut, malesuada vitae odio. Mauris rutrum leo quis sapien cursus vehicula. Ut id
			sapien neque. Nunc tortor dolor, mattis a orci nec, elementum faucibus massa. Quisque eget
			egestas lectus. Sed dignissim urna vitae magna consectetur molestie. Ut facilisis consectetur
			magna, ut egestas erat vestibulum a. Phasellus faucibus nibh sed magna tempus, eget bibendum
			metus hendrerit.
		</p> -->
	</div>
	<div class="button-bar">
		<button on:click={startGame}>start your adventure</button>
	</div>
</div>

<style>
	.intro-container {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
	}
	.content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.button-bar {
		position: sticky;
		bottom: 0;
		width: 100%;
		display: flex;
		justify-content: center;
		background-color: #363636c4;
		padding-block: 0.5rem;
	}
</style>
