# Block.js

Block.js is a lightweight JavaScript library designed to simplify the creation and manipulation of block-based user interfaces. It provides a small set of tools and components that make it easy to build interactive and responsive layouts using a block-based approach.

## Goals/Features

- **Lightweight**: Minimal footprint, ensuring fast load times and performance.
- **Customizable**: Highly customizable components to fit your design needs.
- **Extensible**: Easily extendable with plugins and custom components.

## Usage

Here's a basic example of how to use Block.js:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Block.js Example</title>
    <script src="block.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        const app = document.getElementById('app');
        const block = new Block({
            content: 'Hello, Block.js!'
        });
        app.appendChild(block.render());
    </script>
</body>
</html>
```

### Using BlockTemplate

`BlockTemplate` allows you to define reusable templates for your blocks. Here's an example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlockTemplate Example</title>
    <script src="block.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        const app = document.getElementById('app');

        // Define a template
        const MyTemplate = new BlockTemplate({
            blocks: [
                { type: 'Block', content: 'Hello, BlockTemplate!' },
                { type: 'ButtonBlock', content: 'Click Me' },
                { type: 'ListBlock', items: ['Item 1', 'Item 2', 'Item 3'] }
            ],
            components: {
                ButtonBlock,
                ListBlock,
                ListItemBlock
            }
        });

        // Render the template
        app.innerHTML = MyTemplate.toString();
    </script>
</body>
</html>
```



