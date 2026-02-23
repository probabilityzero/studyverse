# Local-First File Manager

A modern, local-first file management system built with Next.js and Bun. Manage, edit, and save files with a responsive, developer-friendly interface.

## Features

- **Local File System Access** - Browse and edit files from your local directory
- **Real-time Editing** - Edit files with an integrated text editor
- **Split View** - Resizable file explorer sidebar and editor panel
- **Auto-save** - Save changes directly to the filesystem
- **Connection Status** - Real-time indicator of backend server connection
- **Directory Navigation** - Expand/collapse directories for easy navigation
- **Security** - Path traversal protection and access control

## Architecture

This MVP uses a client-server architecture:

### Backend (Bun + Hono)
- **Port**: 3001
- **File Server**: Handles file I/O operations
- **API Endpoints**:
  - `GET /api/list` - List files in a directory
  - `GET /api/file` - Read file contents
  - `POST /api/save` - Save file contents

### Frontend (Next.js + React)
- **Port**: 3000
- **Components**:
  - `FileExplorer` - Directory tree navigation
  - `FileEditor` - Text editor with save functionality
  - Connection status indicator

## Getting Started

### Prerequisites
- Node.js 18+
- Bun (for running the backend server)
- pnpm (recommended package manager)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Install Bun (if not already installed):
```bash
curl -fsSL https://bun.sh/install | bash
```

### Development

Run both frontend and backend concurrently:

```bash
pnpm run dev
```

This will start:
- **Next.js frontend** on `http://localhost:3000`
- **Bun file server** on `http://localhost:3001`

### Configuration

You can configure the base directory for file operations by setting the `FILE_DIR` environment variable:

```bash
FILE_DIR=/path/to/your/files pnpm run dev
```

By default, it uses the `~/Documents` directory.

## Project Structure

```
.
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── FileExplorer.tsx    # Directory tree component
│   ├── FileEditor.tsx      # Text editor component
│   └── ui/                 # shadcn/ui components
├── server/
│   ├── server.ts           # Bun/Hono backend server
│   └── bunfig.toml         # Bun configuration
└── package.json            # Project dependencies
```

## Usage

1. **Navigate Files**: Use the left sidebar to expand directories and view files
2. **Select File**: Click on a file to open it in the editor
3. **Edit Content**: Modify file content in the main editor area
4. **Save Changes**: Click the "Save" button or use Ctrl+S shortcut (when implemented)
5. **Monitor Connection**: Check the server status indicator in the header

## Future Enhancements

- Keyboard shortcuts for save/open
- Syntax highlighting for code files
- File search functionality
- Recent files list
- Undo/redo support
- Tauri desktop app version
- AI context integration

## API Documentation

### GET /api/list
Lists files and directories in a given path.

**Query Parameters**:
- `dir` - Directory path (default: `/`)

**Response**:
```json
{
  "files": [
    { "name": "file.txt", "type": "file", "path": "/file.txt" },
    { "name": "folder", "type": "dir", "path": "/folder" }
  ],
  "basePath": "/"
}
```

### GET /api/file
Reads file contents.

**Query Parameters**:
- `path` - File path (required)

**Response**:
```json
{
  "content": "file contents...",
  "path": "/file.txt"
}
```

### POST /api/save
Saves file contents.

**Request Body**:
```json
{
  "path": "/file.txt",
  "content": "new content..."
}
```

**Response**:
```json
{
  "success": true,
  "path": "/file.txt"
}
```

## Security Considerations

- All file operations are restricted to the configured base directory
- Path traversal attempts are blocked
- Hidden files (starting with `.`) are filtered out by default
- Input validation is performed on all file paths

## License

MIT
