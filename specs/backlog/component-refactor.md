## Process

1. Create a detailed implementation plan document
   a. Loop through each item and do these things: - Use chrome tools to view the current UI related to each issue and take before screenshots and videos of the animations - write the file locations for the captures assets related to the item - Write details about the current issues and recommendations on how to improve the issue from a visual design standpoint - Write brief suggestion on how to address the issue technically
2. Have the @agent-parallel-work-orchestrator review the plan and update teh document to indicate what work can be done in parallel and assign an agent to the item
3. Begin the implementation by deploying agents to tackle each item
4. When an agent completes their work, have the @agent-web-design-expert review the issue visually and capture new "after" assets for the item
5. Have the web design expert update the document with their new assets and a review of the changes. this includes any further work or corrections that should be done to provide AAA quality UX
6. Continue iterating through the list of items and deploying agents to repeat steps 3-5 until all items have been address and the web design experts notes have been added to the plan document.
7. Once all items are addressed, have the @agent-parallel-work-orchestrator review the updated plan document and write a phase 2 plan document to address any remaining issues identified by the web design experts.
8. Then repeat steps 2-6 on the phase 2 document
9. Once all items have been addressed in the phase 2 document, repeat step 7 on have the agent create a phase 3 plan document.
10. Repeat this process, creating a new phase plan document after each phase, and working through each item and phase systematically until the web design expert provides a AAA rating to all identified issues

## Issues

- app name should be "Dream Console" instead of SRPG or DC-S-0.1.0 in header and splash screen
- version number from package.json should be displayed on the about component
- we can remove the settings/options modal from the home screen
- DO NOT CHANGE THE NEURAL BACKGROUD OR THE PARTICLES
- Make the animations smoother
  - animations should feel mechanical and/or ethereal. prefer linear and easing versus "bouncy" effects
  - Home page
    - Home page modals for help and about
  - Story Mode
    - opening story mode
    - opening a game save in story mode
    - moving between rounds in story mode
    - closing a game in story mode
  - Game Page
    - Dice fade out is not always smooth. appears to "jump" below the status display and background. it also has too long of a delay
    - game container should not be clickable while a modal is open
    - The Help modal is the best we have in the entire app. it needs to be a bit faster but this should be what all modal use as their base component to handle the fog overlay and open close animations
      - exit confirmation
      - dice theme selector
    - Card / Deck
      - Card background animation is too "busy" and should be more subtle and integrate smoothly with the rest of the viewport visually
      - The badge animation should be more subtle
      - Cards should not have hover style changes
      - The status display should be visible enough to be legible while a card is being viewed. i can be slightly obscured by the fog overlay etc but the card content should not overlay the status display
      - The background and the card text colors should have sufficient contrast and be easy to read
      - the transition from card closing to stability check is not smooth. the card starts to fade out and then it appears to disappear without completing the fade out etc.
    - Journal Entry
      - closing the journal entry does not transition smoothly
