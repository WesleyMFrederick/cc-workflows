# LinkedIn QR Generator

Generate branded QR codes with custom logo embedding for any URL.

## Features

- ✓ Generate QR codes for any valid URL
- ✓ Embed custom PNG logos in QR code center
- ✓ Default LinkedIn logo support
- ✓ High error correction (30% recovery) for reliable scanning
- ✓ Screen-optimized resolution (500x500px)
- ✓ Automatic timestamped filenames
- ✓ Clear validation error messages

## Installation

```bash
# Install dependencies (from workspace root)
npm install
```

## Usage

### Generate QR code with default LinkedIn logo

```bash
npm run qr-gen -- https://www.linkedin.com/in/wesleyfrederick/
```

### Generate QR code with custom logo

```bash
npm run qr-gen -- https://example.com ./path/to/your-logo.png
```

## Output

Generated QR codes are saved to `output/` directory with timestamped filenames:

```text
output/qr-2025-10-21-143052.png
```

## Technical Specifications

| Specification | Value | Rationale |
|---------------|-------|-----------|
| Image Size | 500x500px | Optimized for screen display (72-96 DPI) |
| QR Error Correction | High (30% recovery) | Logo embedding with scannability |
| Logo Size | ~100px (20% of QR) | Balances visibility with scan reliability |
| Output Format | PNG | Universal compatibility, transparency support |
| Filename Pattern | `qr-{timestamp}.png` | No overwrites, multi-output |
| Supported Logo Formats | PNG only | Simplifies MVP, ensures transparency |

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Examples

### LinkedIn Profile

```bash
npm run qr-gen -- https://www.linkedin.com/in/yourname/
```

### Website

```bash
npm run qr-gen -- https://yourwebsite.com
```

### GitHub Repository

```bash
npm run qr-gen -- https://github.com/user/repo
```

## Error Handling

The tool provides clear error messages for common issues:

- **Invalid URL format**: `"URL must include protocol (http:// or https://)"`
- **Missing logo file**: `"Logo file not found at {path}"`
- **Invalid logo format**: `"Logo file must be PNG format. Received: {extension}"`
- **Default logo missing**: `"Default logo not found at assets/linkedin-logo.png"`

## Architecture

The tool follows action-based file organization with a linear transformation pipeline:

```text
Command Line Args (URL, optional logo path)
    ↓
[Validate URL] → validates URL format
    ↓
[Validate Logo] → validates logo file exists and is PNG (uses default if not provided)
    ↓
[Generate QR Code] → creates base QR with high error correction
    ↓
[Embed Logo] → composites custom logo onto QR center
    ↓
[Ensure Output Dir] → creates output/ if needed
    ↓
[Save File] → writes PNG with timestamp
    ↓
Output: qr-{timestamp}.png
```

Each transformation is a dedicated module with clear contracts.

## License

ISC
