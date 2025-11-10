# DC Solo RPG CSS Theme

This CSS theme file uses CSS variables to apply styling to the DC Solo RPG web component. Here's a breakdown of the CSS variables used:

## General

- `--dc-default-font-family`: Sets the default font family for the web component. The font family is 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif.
- `--dc-default-container-bg`: Sets the default background color for containers in the web component. The color is a semi-transparent white (rgba(255, 255, 255, 0.3)).
- `--dc-default-text-color`: Sets the default text color for the game. The default is set to: inherit;
- `--dc-default-game-bg`: Sets the background of the component.
- `--dc-accent-color`: Sets the accent color used throughout the web component. The color is a shade of blue (rgb(58, 159, 199)).
- `--dc-default-border-radius`: Sets the default border radius for elements in the web component. The border radius is 1rem.
- `--dc-default-padding`: Sets the default padding for elements in the web component. The padding is 1rem.
- `--dc-default-boxshadow`: Sets the default box shadow for elements in the web component. The box shadow is 0 2px 5px rgba(0, 0, 0, 0.1).
- `--dc-toolbar-height`: Sets the height of the toolbar in the web component. The height is 3rem.
- `--dc-header-block-margin`: Sets the margin for header blocks in the web component. The margin is 0.25rem.
- `--dc-status-display-padding`: Sets the padding for the status display in the web component. The padding is the same as the default padding.

## Dice Roller

- `--dc-dice-roller-bg`: ~~Sets the background color for the dice roller in the web component.~~ **DEPRECATED**: This variable is no longer used. The game board background (`.dc-table-bg`) is now transparent to allow the neural network animation to be visible on all screens (dice rolling, card drawing, journal entry, etc.).

## Cards

- `--dc-card-back-color`: Sets the color for the back of the cards in the web component. The color is white.
- `--dc-card-back-bg`: Sets the background color for the back of the cards in the web component. The color is #1387b9.
- `--dc-card-back-color`: Sets the color for the front of the cards in the web component. The default value is `inherit`.
- `--dc-card-front-bg`: Sets the background color for the front of the cards in the web component. The color is rgb(235, 235, 235).
- `--dc-card-border`: Sets the border for the cards in the web component. The border is 1px solid #000000.
- `--dc-card-border-radius`: Sets the border radius for the cards in the web component. The border radius is 1rem.
- `--dc-card-width`: Sets the width of the cards in the web component. The width is 200px.
- `--dc-card-height`: Sets the height of the cards in the web component. The height is 300px.

## Health Meter

- `--dc-health-meter-high`: Sets the color for the high health status in the health meter of the web component. The color is green.
- `--dc-health-meter-med`: Sets the color for the medium health status in the health meter of the web component. The color is orange.
- `--dc-health-meter-low`: Sets the color for the low health status in the health meter of the web component. The color is red.
- `--dc-health-meter-stroke`: Sets the stroke color for the health meter in the web component. The color is a semi-transparent black (rgba(0, 0, 0, 0.8)).

## Token Counters

- `--dc-success-token-stroke: var(--dc-default-text-color);`: Sets the stroke for a success token
- `--dc-success-token-fill: var(--dc-accent-color);`: Sets the fill for a success token
- `--dc-failure-token-stroke: var(--dc-card-back-bg);`: Sets the stroke for a failure token
- `--dc-failure-token-fill: var(--dc-accent-color);`: Sets the fill for a failure token

These variables allow you to easily customize the appearance of the DC Solo RPG web component. You can override these variables in your own CSS to apply your custom styles.

## Example CSS

```css
:root {
	/*General*/
	--dc-default-font-family:
		'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana,
		sans-serif;
	--dc-default-container-bg: rgba(255, 255, 255, 0.3);
	--dc-accent-color: rgb(58, 159, 199);

	--dc-default-border-radius: 1rem;
	--dc-default-padding: 1rem;
	--dc-default-boxshadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	--dc-toolbar-height: 3rem;
	--dc-header-block-margin: 0.25rem;

	--dc-status-display-padding: var(--dc-default-padding);

	/*Dice Roller*/
	--dc-dice-roller-bg: #cccfd1;

	/*Cards*/
	--dc-card-back-color: white;
	--dc-card-back-bg: #1387b9;
	--dc-card-front-bg: rgb(235, 235, 235);
	--dc-card-border: 1px solid #000000;
	--dc-card-border-radius: 1rem;
	--dc-card-width: 200px;
	--dc-card-height: 300px;

	/*Health meter*/
	--dc-health-meter-high: green;
	--dc-health-meter-med: orange;
	--dc-health-meter-low: red;
	--dc-health-meter-stroke: rgba(0, 0, 0, 0.8);

	/*Counter Tokens*/
	--dc-success-token-stroke: var(--dc-default-text-color);
	--dc-success-token-fill: var(--dc-accent-color);
	--dc-failure-token-stroke: var(--dc-card-back-bg);
	--dc-failure-token-fill: var(--dc-accent-color);
}
```

## Additional Classes

1. `dc-game-container`: This class is likely used to style the main game container, setting its size, position, and other layout-related properties.

2. `game-screen`: This class is likely used to style the main game screen, setting its size, background, and other visual properties.

3. `status-display-area`: This class is likely used to style the area where the game status is displayed.

4. `dc-fade-in`: This class is likely used to apply a fade-in animation or transition effect to elements.

5. `status-display-container`: This class is likely used to style the container that holds the status display elements.

6. `failure-container`: This class is likely used to style the container that holds the failure-related elements.

7. `health-meter`: This class is likely used to style the health meter element.

8. `dc-health-meter-stroke`: This class is likely used to style the stroke of the health meter.

9. `high`: This class could be used to indicate a high level or status, possibly changing the color or appearance of elements.

10. `dc-health-meter-bg`: This class is likely used to style the background of the health meter.

11. `health-score`: This class is likely used to style the health score element.

12. `success-counters-container`: This class is likely used to style the container that holds the success counter elements.

13. `token`: This class is likely used to style the token elements.

14. `filled`: This class could be used to indicate a filled or completed state, possibly changing the color or appearance of elements.

15. `toolbar-area`: This class is likely used to style the toolbar area.

16. `toolbar`: This class is likely used to style the toolbar itself.

17. `left`: This class is likely used to style or position elements on the left.

18. `center`: This class is likely used to style or position elements in the center.

19. `right`: This class is likely used to style or position elements on the right.

20. `dc-exit-button`: This class is likely used to style the exit button.

21. `main-screen-area`: This class is likely used to style the main screen area.

22. `dc-table-bg`: **NOTE**: As of the latest update, this class now has a transparent background instead of using `--dc-dice-roller-bg`. This allows the neural network animation background to be visible on all game screens (dice rolling, card drawing, journal entry). The background is controlled by the parent `.dc-game-bg` class.

23. `dc-roll-tasks-container`: This class is likely used to style the container that holds the roll tasks.

24. `dc-dice-roller-container`: This class is likely used to style the dice roller container.

25. `dc-dice-roller-header`: This class is likely used to style the header of the dice roller.

26. `dc-header`: This class is likely used to style headers in the game.
