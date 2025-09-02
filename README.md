# FFStudio Website

A modern, responsive website for FFStudio - a powerful video processing application powered by FFmpeg.

## Project Structure

```
ff-studio-page/
├── index.html              # Main HTML file
├── tutorial-reader.html    # Full tutorial reading page
├── css/
│   ├── styles.css          # All CSS styles
│   └── tutorial-reader.css # Tutorial reader styles
├── js/
│   ├── main.js             # JavaScript functionality
│   ├── content-loader.js   # Content management system
│   └── tutorial-reader.js  # Tutorial reader functionality
├── content/                 # Content files (JSON)
│   ├── site-config.json    # Site configuration
│   ├── features.json       # Feature descriptions
│   ├── tutorials.json      # Tutorial content
│   ├── downloads.json      # Download information
│   └── links.json          # Centralized link management
├── assets/
│   ├── images/             # Image assets
│   │   ├── logo.png        # Logo image
│   │   └── tutorials/      # Tutorial images
│   └── icons/              # Icon assets
│       └── favicon.ico     # Website favicon
├── README.md               # Project documentation
└── CONTENT-GUIDE.md        # Content management guide
```

## Features

- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox
- **Dark Theme**: Professional dark color scheme optimized for video editing applications
- **Interactive Elements**: Smooth scrolling, hover effects, and tutorial filtering
- **Modern UI**: Clean, professional design with smooth animations
- **Cross-browser Compatible**: Built with modern web standards
- **Content Management System**: Easy-to-use JSON-based content management without databases
- **Dynamic Content Loading**: Automatic content updates from JSON files
- **Search & Filtering**: Built-in search and category filtering for tutorials
- **Expandable Features**: Show/hide additional features with dynamic loading
- **Full Tutorial Reading**: Dedicated tutorial reader with sections, images, and YouTube videos
- **Progress Tracking**: Reading progress bar and navigation between tutorials

## Sections

1. **Header**: Navigation with logo and menu
2. **Hero**: Main call-to-action section
3. **Features**: Key application features with icons
4. **Tutorials**: Interactive tutorial showcase with filtering
5. **Downloads**: Platform-specific download options
6. **Footer**: Links, social media, and legal information

## Setup Instructions

1. **Clone or download** the project files
2. **Open `index.html`** in your web browser
3. **Customize content** by editing the JSON files in the `content/` folder
4. **Replace placeholder assets** with your actual images and icons
5. **Run from a web server** (not file:// protocol) for content loading to work

**Note**: The content management system requires a web server to function properly. You can use:
- Python: `python -m http.server 8000`
- Node.js: `npx serve`
- Any local web server of your choice

## Customization

### Colors
The main color scheme is defined in `css/styles.css`:
- Primary: `#0078d4` (Blue)
- Secondary: `#4dabf7` (Light Blue)
- Background: `#1a1a1a` (Dark)
- Text: `#e0e0e0` (Light Gray)

### Fonts
The website uses system fonts for optimal performance:
- Primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif`

### Icons
Icons are provided by Font Awesome 6.4.0 via CDN.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- **Font Awesome 6.4.0**: For icons (loaded via CDN)
- **No other external dependencies** required

## Development

To modify the website:

1. **Content**: Edit JSON files in the `content/` folder (recommended)
2. **HTML Structure**: Edit `index.html` for structural changes
3. **Styling**: Modify `css/styles.css` for design changes
4. **Functionality**: Update `js/main.js` for interactive features
5. **Assets**: Replace placeholder files in `assets/` directory

### Content Management

The easiest way to update content is through the JSON files:
- **Tutorials**: Edit `content/tutorials.json`
- **Features**: Edit `content/features.json`
- **Downloads**: Edit `content/downloads.json`
- **Site Settings**: Edit `content/site-config.json`

See `CONTENT-GUIDE.md` for detailed instructions on managing content.

## License

This project is provided as-is for educational and development purposes.

## Credits

- Built with modern web technologies
- Icons by Font Awesome
- Design inspired by modern video editing applications
