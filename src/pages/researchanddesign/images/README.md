# RDTI Guide Mermaid Chart Images

This directory contains PNG image files generated from Mermaid charts in the RDTI_GUIDE.md file.

## Files Overview

### Source Files (.mmd)
- 16 Mermaid chart definition files extracted from RDTI_GUIDE.md
- Each file contains the raw Mermaid syntax for a specific chart

### Generated Images (.png)
- 16 high-quality PNG images (1200x800px, 2x scale)
- White background, default theme
- Optimized for viewing in markdown viewers that don't support Mermaid

### Conversion Script
- `convert-mermaid.sh`: Batch conversion script using mermaid-cli
- Converts all .mmd files to PNG images with optimal settings

## Chart Index

| File | Description | Size |
|------|-------------|------|
| `01-eligibility-decision-tree.png` | Complete R&DTI eligibility assessment flowchart | 331 KB |
| `02-core-vs-supporting-classification.png` | Core vs Supporting activities classification | 368 KB |
| `03-excluded-activities-mindmap.png` | Excluded activities organized by category | 270 KB |
| `04-documentation-requirements-flow.png` | Documentation workflow from start to completion | 121 KB |
| `05-documentation-best-practices.png` | Best practices vs red flags checklist | 45 KB |
| `06-technical-uncertainty-framework.png` | Technical uncertainty assessment process | 170 KB |
| `07-competent-professional-standard.png` | Competent professional criteria and assessment | 82 KB |
| `08-systematic-progression-process.png` | 5-phase systematic R&D progression | 444 KB |
| `09-documentation-per-phase.png` | Required documents for each R&D phase | 109 KB |
| `10-knowledge-evaluation.png` | Knowledge gap evaluation framework | 273 KB |
| `11-industry-specific-considerations.png` | Industry-specific R&D considerations | 243 KB |
| `12-compliance-timeline-gantt.png` | Annual compliance timeline (Gantt chart) | 99 KB |
| `13-monthly-compliance-checklist.png` | Monthly, quarterly, and annual tasks | 126 KB |
| `14-critical-success-factors.png` | Key factors for R&DTI success | 37 KB |
| `15-risk-assessment-matrix.png` | Risk assessment quadrant chart | 118 KB |
| `16-consultant-action-steps.png` | Consultant assessment protocol | 317 KB |

## Technical Details

### Generated Using
- **Tool**: @mermaid-js/mermaid-cli (version 11.9.0)
- **Command**: `mmdc -i input.mmd -o output.png -t default -b white --scale 2 --width 1200 --height 800`
- **Settings**: Default theme, white background, 2x scaling for crisp display

### Integration
- Images are embedded in RDTI_GUIDE.md alongside the original Mermaid code blocks
- Users can see both the raw syntax and rendered visuals
- Compatible with all markdown viewers and documentation platforms

## Usage

The PNG images provide visual charts for users whose markdown viewers don't support Mermaid rendering. They complement the original Mermaid syntax blocks in the guide, ensuring universal accessibility of the visual assessment tools.

### Regenerating Images

To regenerate all images after modifying the .mmd files:

```bash
cd /path/to/images/directory
./convert-mermaid.sh
```

Or manually convert individual files:

```bash
mmdc -i chart-name.mmd -o chart-name.png -t default -b white --scale 2 --width 1200 --height 800
```

---

*Generated: August 10, 2025*  
*Total Images: 16*  
*Total Size: ~3.0 MB*