# Claude Code Guide for JSorolla

## Project Overview

JSorolla is a JavaScript library for biological and genomic data visualization. It provides web components and visualization tools for bioinformatics applications, primarily focused on genomic variant analysis through the IVA (Interactive Variant Analysis) application.

**Key Technologies:**
- Lit web components (modern web components)
- ES6+ JavaScript
- Bootstrap 5 for UI
- Highcharts for data visualization
- Webpack for bundling
- Cypress for E2E testing
- OpenCGA and CellBase APIs for genomic data
- AI integration (Google Gemini and OpenAI)

**Repository Info:**
- Main development branch: `develop`
- Production releases: `master`
- Current version: 5.0.0-dev

## Codebase Structure

```
jsorolla/
├── src/
│   ├── webcomponents/       # Lit web components (main application layer)
│   │   ├── alignment/       # Alignment-related components
│   │   ├── clinical/        # Clinical analysis components
│   │   ├── commons/         # Shared/reusable components
│   │   ├── variant/         # Variant analysis components
│   │   └── ...              # Other domain-specific components
│   ├── sites/
│   │   └── iva/            # IVA application (main deployment)
│   ├── genome-browser/      # Genome visualization engine
│   ├── circular-genome-viewer/
│   ├── network-viewer/      # Network/graph visualization
│   ├── threed-viewer/       # 3D molecular visualization
│   └── core/               # Core utilities and adapters
│       ├── clients/         # REST API clients
│       ├── data-adapter/    # Data format adapters (VCF, BAM, etc.)
│       ├── bioinfo/         # Bioinformatics utilities
│       └── cache/           # Caching mechanisms
├── custom-sites/           # Custom deployments for specific clients
├── cypress/               # E2E tests
├── build/                 # Build output (demos)
├── dist/                  # Distribution output (libs)
└── docs/                  # Documentation

```

## Key Patterns and Conventions

### Web Components Architecture

Components are built using [Lit](https://lit.dev/):
- All web components extend `LitElement`
- Use decorators for reactive properties: `@property()`
- Follow custom element naming: `kebab-case` (e.g., `variant-browser`, `clinical-analysis-grid`)
- Component file naming: `component-name.js`
- Keep components in domain-specific folders under `src/webcomponents/`

### Component Lifecycle
- `constructor()` - Initialize properties
- `firstUpdated()` - Runs once after first render
- `update(changedProperties)` - Called before render
- `render()` - Returns template
- `updated(changedProperties)` - Runs after render

### State Management
- Components use reactive properties for state
- Parent-child communication via properties and events
- Use `this.requestUpdate()` to trigger re-renders when needed
- Avoid direct DOM manipulation

### API Integration
- OpenCGA client: Primary genomic data API
- CellBase client: Genomic annotation data
- Clients located in `src/core/clients/`
- REST responses wrapped in `RestResponse` class

### Configuration Pattern
Many components use `.settings.js` files for configuration:
- Located in `src/sites/iva/conf/`
- Define columns, filters, and display options
- Follow existing patterns when modifying

## Common Development Tasks

### Starting Development Server
```bash
npm run serve
# Opens at http://localhost:3000 (or configured port)
```

### Building
```bash
npm run build        # Build demos
npm run dist         # Build distributable libraries
```

### Running Tests
```bash
npm run test:open    # Interactive Cypress test runner
npm run test:run     # Headless test execution
```

### Linting
```bash
npm run eslint
```

## Working with Claude Code

### When Adding New Features

1. **Explore existing patterns first**: Search for similar components or features
   - Use `Grep` to find similar implementations
   - Check `src/webcomponents/commons/` for reusable components
   - Review configuration files in `src/sites/iva/conf/`

2. **Understand the data flow**:
   - Identify the API endpoints (OpenCGA or CellBase)
   - Check existing adapters in `src/core/data-adapter/`
   - Understand the data structure before building UI

3. **Follow component patterns**:
   - Use existing components as templates
   - Reuse common components (filters, grids, modals)
   - Keep components focused and composable

4. **Test changes**:
   - Test with dev server (`npm run serve`)
   - Add Cypress tests for critical paths
   - Verify on different browsers

### When Fixing Bugs

1. **Locate the issue**:
   - Check component file in `src/webcomponents/`
   - Look for related configuration in `src/sites/iva/conf/`
   - Review API client calls in component

2. **Understand context**:
   - Read component lifecycle methods
   - Check parent-child relationships
   - Review recent git commits: `git log --oneline <file>`

3. **Make focused changes**:
   - Fix only what's needed
   - Don't refactor unrelated code
   - Keep changes minimal and testable

### Code Search Tips

- **Find components**: `variant-browser` (search for custom element tags)
- **Find API usage**: Search for method names like `opencgaSession.opencgaClient.variants()`
- **Find configurations**: Look in `src/sites/iva/conf/*.settings.js`
- **Find templates**: Search for `html\`` or `render()` methods

## Important Considerations

### Bioinformatics Domain Knowledge

- **Variants**: SNVs, CNVs, structural variants, rearrangements
- **Clinical analysis**: Interpretation workflows for cancer and rare disease
- **Pedigrees**: Family relationships and inheritance patterns
- **Genome browser**: Coordinate systems, tracks, regions

If unsure about domain concepts, ask the user for clarification.

### Performance Considerations

- Large genomic datasets require:
  - Pagination (use OpenCGA pagination)
  - Virtual scrolling for grids
  - Lazy loading of components
  - Efficient rendering (avoid unnecessary re-renders)

### Security

- User authentication via OpenCGA session
- Never commit credentials or API keys
- Validate user inputs
- Sanitize data before rendering (XSS prevention)

### AI Integration

The project includes AI features:
- AI text transformation in markdown editors
- Multi-generational pedigree editing
- Located in web components with AI-related functionality
- Uses Google Gemini (`@google/genai`) and OpenAI APIs

### Browser Compatibility

Target browsers (from package.json):
- Chrome > 79
- Firefox > 75
- No IE11 support

## Git Workflow

**IMPORTANT**: The developer handles all Git operations (branching, commits, push/pull, PRs). Claude Code should focus on code changes only.

### Branch Strategy
- Feature branches from `develop`
- Branch naming: `TASK-####` (Jira-style) or descriptive names
- Merge to `develop` via pull requests

### Commit Message Conventions
```bash
# Good commit messages
git commit -m "wc: fix variant filter reset on study change #TASK-1234"
git commit -m "core: add caching for CellBase gene queries"
git commit -m "docs: update README with new build instructions"
```

Prefix conventions (for reference):
- `wc:` - web components changes
- `core:` - core library changes
- `genome-browser:` - genome browser changes
- `docs:` - documentation
- `test:` - test changes

## File Organization

### Where to Add New Code

- **New web component**: `src/webcomponents/<domain>/<component-name>.js`
- **Shared utilities**: `src/core/utils.js` or create specific utility file
- **New API client**: `src/core/clients/`
- **Configuration**: `src/sites/iva/conf/`
- **Styles**: Component-specific styles in component, global in `styles/`
- **Tests**: `cypress/e2e/` (mirror source structure)

### What NOT to Create

- Don't create markdown documentation files unless explicitly requested
- Don't add unnecessary configuration files
- Don't create duplicate utilities (search first)
- Don't add dependencies without discussing with maintainers

## Testing

### Cypress E2E Tests
- Located in `cypress/e2e/`
- Test critical user workflows
- Use data attributes for selectors: `data-cy="element-id"`
- Follow existing test patterns

### Manual Testing Checklist
- [ ] Test in development mode (`npm run serve`)
- [ ] Check browser console for errors
- [ ] Verify API calls in Network tab
- [ ] Test with realistic data
- [ ] Check responsive design
- [ ] Test user interactions (clicks, forms, filters)

## Resources

### Key Dependencies Documentation
- [Lit](https://lit.dev/) - Web components
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/) - UI framework
- [Highcharts](https://www.highcharts.com/) - Charting
- [Cypress](https://www.cypress.io/) - Testing

### Project Links
- Repository: https://github.com/opencb/jsorolla
- Issue tracking: https://zettagenomics.com/academic/

### Getting Help
- Check existing code for patterns
- Review component documentation in source files
- Ask user for domain-specific clarification
- Consult maintainers for architectural decisions

## Common Pitfalls

1. **Forgetting to import Lit**: Components need `import { LitElement, html } from "lit";`
2. **Not using reactive properties**: Use `@property()` or `static properties = {}`
3. **Mutating arrays/objects directly**: Create new references for reactivity
4. **Hardcoded configuration**: Use configuration files in `src/sites/iva/conf/`
5. **Not handling async data**: Check for data existence before rendering
6. **Breaking existing components**: Changes to commons components affect many pages

## Quick Reference

### Common Commands
```bash
npm install          # Install dependencies
npm run serve       # Start dev server
npm run build       # Build for production
npm run test:open   # Open Cypress
npm run test:run    # Run tests headless
npm run eslint      # Lint code
```

### Finding Things
- Component definition: Search for `class ComponentName extends LitElement`
- Component usage: Search for `<component-name` in templates
- API calls: Search for `opencgaClient.` or `cellbaseClient.`
- Event handlers: Search for `@click=` or `.addEventListener`
- Configuration: Check `src/sites/iva/conf/`

---

**Last Updated**: 2026-02-01
**For**: Claude Code AI Assistant
**Maintained By**: JSorolla Development Team
