# Pedigree Multi-Generational Editor - Quick Start Guide

## Quick Links

- **Test Page:** `/src/core/visualisation/test/pedigree-multigenerational.html`
- **Main Code:** `/src/core/visualisation/pedigree.js`
- **Web Component:** `/src/webcomponents/commons/view/pedigree-view.js`
- **Test Data:** `/src/core/visualisation/test/resources/family-4gen.js`

## 5-Minute Demo

### 1. Open the Test Page
```bash
# Navigate to the test directory and open in browser
open src/core/visualisation/test/pedigree-multigenerational.html
```

### 2. Try Interactive Features
- Click **"Move Mode"** → drag any individual to reposition
- Click **"Add Marriage"** → click two individuals to connect them
- Click **"Reset Layout"** → restore automatic positioning

### 3. View Special Symbols
The test data includes:
- 👥 Monozygotic twins (C1 & C2)
- ⚫ Carriers (GGM2, GM2, M1)
- 💀 Deceased (GGF1, GGF2, GGM1, GGM2)
- 🔴 Affected (F1, C1)
- 📍 Proband arrow (C1)
- 🔲 Adoption brackets (C2)

## Basic Usage

### Simple Non-Interactive Pedigree
```javascript
import Pedigree from "./pedigree.js";

const familyData = {
    members: [
        { id: "1", sex: "MALE", disorders: [] },
        { id: "2", sex: "FEMALE", disorders: [] },
        {
            id: "3",
            father: {id: "1"},
            mother: {id: "2"},
            sex: "MALE",
            disorders: []
        }
    ],
    disorders: []
};

const pedigree = new Pedigree(familyData);
const svg = pedigree.pedigreeFromFamily(familyData, {
    width: 1200,
    height: 600
});

document.getElementById('container').appendChild(svg);
```

### Interactive Pedigree with Dragging
```javascript
const svg = pedigree.pedigreeFromFamily(familyData, {
    width: 1200,
    height: 600,
    interactive: true  // Enable interactivity
});

// Listen for position changes
svg.addEventListener('pedigree:positionChanged', (e) => {
    console.log('Individual moved:', e.detail.individual);
    // Save positions to database
    savePositions(familyData);
});
```

### Using the Web Component
```html
<pedigree-view
    .family="${familyData}"
    .interactive="${true}"
    .config="${{height: 600}}"
    @familyChanged="${handleFamilyChange}">
</pedigree-view>
```

```javascript
function handleFamilyChange(event) {
    const updatedFamily = event.detail.family;
    console.log('Family data changed:', updatedFamily);
    // Persist changes
}
```

## Data Format

### Minimal Family
```javascript
{
    "members": [
        {
            "id": "1",
            "sex": "MALE"
        }
    ],
    "disorders": []
}
```

### Complete Individual
```javascript
{
    "id": "unique-id",
    "name": "John Doe",
    "father": {id: "father-id"},
    "mother": {id: "mother-id"},
    "sex": "MALE",  // MALE, FEMALE, or UNKNOWN
    "age": "45",
    "lifeStatus": "DECEASED",  // ALIVE or DECEASED

    // Disorders
    "disorders": [{id: "disorder-1"}],
    "carrier": true,

    // Special symbols
    "twinGroup": "twin-1",
    "twinType": "MONOZYGOTIC",  // or DIZYGOTIC
    "adopted": true,
    "proband": true,
    "pregnancy": true,

    // Auto-generated (optional)
    "generation": 1,
    "position": {
        "x": 300,
        "y": 150,
        "manuallyPositioned": false
    }
}
```

## Common Patterns

### Adding a New Individual
```javascript
familyData.members.push({
    id: "new-person",
    father: {id: "existing-father"},
    mother: {id: "existing-mother"},
    sex: "FEMALE",
    disorders: []
});

// Re-render
pedigree.pedigreeFromFamily(familyData);
```

### Creating a Marriage
```javascript
// Method 1: Automatic (from parent relationships)
// Just add children with father/mother - marriages auto-generated

// Method 2: Interactive mode
pedigree.setMode('add_marriage');
// Click two individuals in the UI

// Method 3: Programmatic
familyData.marriages = familyData.marriages || [];
familyData.marriages.push({
    id: "marriage-1",
    partner1: "person-1",
    partner2: "person-2",
    consanguinity: false,
    children: ["child-1", "child-2"]
});
```

### Adding Twin Markers
```javascript
// Mark two individuals as twins
familyData.members[0].twinGroup = "twin-1";
familyData.members[0].twinType = "MONOZYGOTIC";

familyData.members[1].twinGroup = "twin-1";
familyData.members[1].twinType = "MONOZYGOTIC";
```

### Marking the Proband
```javascript
familyData.members.find(m => m.id === "proband-id").proband = true;
```

## Interaction Modes

### Available Modes
```javascript
// View mode (default) - no interaction
pedigree.setMode('view');

// Drag mode - move individuals
pedigree.setMode('drag');

// Add marriage mode - click two people to connect
pedigree.setMode('add_marriage');
```

### Mode Change Events
```javascript
svg.addEventListener('pedigree:modeChanged', (e) => {
    console.log('Mode changed to:', e.detail.mode);
});
```

## Configuration Options

```javascript
{
    width: 1200,              // Canvas width (px)
    height: 600,              // Canvas height (px)
    box: 60,                  // Symbol size (px)

    // Layout
    topMargin: 50,            // Top margin (px)
    horizontalSpacing: 120,   // Space between individuals (px)
    verticalSpacing: 150,     // Space between generations (px)

    // Interactivity
    interactive: false,       // Enable drag & edit

    // Display
    showNames: true,          // Show individual names
    showGenerationLabels: false,  // Show "Gen 0", "Gen 1", etc.

    // Styling
    colors: ["black", "red", "blue"],  // Disorder fill colors
    border: false             // Show border around SVG
}
```

## Events Reference

### pedigree:positionChanged
Fired when an individual is dragged.
```javascript
svg.addEventListener('pedigree:positionChanged', (e) => {
    const individual = e.detail.individual;
    console.log(`${individual.id} moved to (${individual.position.x}, ${individual.position.y})`);
});
```

### pedigree:dataChanged
Fired when family structure changes (marriage added, etc.).
```javascript
svg.addEventListener('pedigree:dataChanged', (e) => {
    const family = e.detail.family;
    console.log('Marriages:', family.marriages);
});
```

### pedigree:modeChanged
Fired when interaction mode changes.
```javascript
svg.addEventListener('pedigree:modeChanged', (e) => {
    console.log('New mode:', e.detail.mode);
});
```

### familyChanged (Web Component)
Fired on any family change.
```javascript
pedigreeView.addEventListener('familyChanged', (e) => {
    const family = e.detail.family;
    // Save to backend
    saveFamilyData(family);
});
```

## Troubleshooting

### Pedigree Not Rendering
1. Check console for errors
2. Verify `family.members` is an array
3. Ensure `family.disorders` exists
4. Check SVG is appended to DOM

### Lines Not Connecting
1. Verify father/mother IDs exist in members array
2. Check marriages array is populated
3. Ensure positions are calculated (check `member.position`)

### Dragging Not Working
1. Verify `interactive: true` in settings
2. Check that `setMode('drag')` was called
3. Ensure event listeners are attached

### Symbols Not Showing
1. Check property spelling (e.g., `carrier`, `adopted`)
2. Verify boolean values (not strings)
3. For twins, ensure both have same `twinGroup`

## Performance Tips

- Use `manuallyPositioned: true` to skip auto-layout for positioned individuals
- Limit family size to ~100 members for smooth dragging
- Throttle save operations during drag events
- Consider lazy loading for very large pedigrees

## Migration from v1.0

Old data format automatically migrates:
```javascript
// v1.0 (still works)
{
    members: [...],
    disorders: [...]
}

// Becomes v2.0
{
    version: "2.0",
    members: [...],  // with position metadata added
    marriages: [...],  // auto-generated from parent relationships
    disorders: [...],
    layoutMode: "AUTO"
}
```

## Next Steps

1. Review `/PEDIGREE_IMPLEMENTATION_SUMMARY.md` for detailed implementation info
2. Explore test page for interactive examples
3. Check out `family-4gen.js` for data structure examples
4. Read pedigree.js source code for advanced customization

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify data structure matches examples
3. Review implementation summary document
4. Test with provided test data first
