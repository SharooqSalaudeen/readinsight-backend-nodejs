import fs from 'fs'
import path from 'path'

const devPackageJsonPath = path.join(__dirname, 'package.json')
const prodPackageJsonPath = path.join(__dirname, 'dist', 'package.json')

// Read the development package.json
fs.readFile(devPackageJsonPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the development package.json:', err)
        return
    }

    let devPackageJson
    try {
        devPackageJson = JSON.parse(data)
    } catch (parseError) {
        console.error('Error parsing the development package.json:', parseError)
        return
    }

    // Create a production package.json object
    const prodPackageJson = {
        name: devPackageJson.name,
        version: devPackageJson.version,
        description: devPackageJson.description,
        main: devPackageJson.main.replace(/^src\//, ''), // Adjust if your output directory structure is different
        scripts: {
            start: 'node server.js',
        },
        dependencies: devPackageJson.dependencies,
        // You can also include other fields like 'author', 'license', etc., if necessary
    }

    // Write the production package.json
    fs.writeFile(
        prodPackageJsonPath,
        JSON.stringify(prodPackageJson, null, 2),
        'utf8',
        (writeErr) => {
            if (writeErr) {
                console.error(
                    'Error writing the production package.json:',
                    writeErr
                )
                return
            }

            console.log('Production package.json created successfully.')
        }
    )
})
