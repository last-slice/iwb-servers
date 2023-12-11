import bpy
import os
import fnmatch

# Specify the root directory containing subdirectories with GLB files
root_directory = "/Users/lastraum/desktop/programming/decentraland/lastslice/sdk7/iwb/3d-wip/"

# Create and open a text file for writing
output_file_path = "/Users/lastraum/desktop/programming/decentraland/lastslice/sdk7/iwb/servers/deploy-server/bulk-upload-server/bounding-boxes-custom.txt"

with open(output_file_path, "w") as output_file:
    # Recursively traverse through all directories and subdirectories
    for root, dirs, files in os.walk(root_directory):
        for file in files:
            if fnmatch.fnmatch(file, "*glb*"):  # Check if the file is a GLB file
                
                # # Write GLB file name, formatted dimensions to the text file
                # output_file.write(f"{file}, {file}\n")
                
                
                
                
                glb_file_path = os.path.join(root, file)
                
                # Extract the file name without the extension
                file_name_without_extension = os.path.splitext(file)[0]

                # # Import the GLB file into Blender
                bpy.ops.import_scene.gltf(filepath=glb_file_path)
                
                # Select all objects in the current scene
                bpy.ops.object.select_all(action='SELECT')

    
                # Get the bounding box dimensions
                bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
                obj = bpy.context.active_object
                bbox = obj.bound_box
                dimensions = [abs(max(p) - min(p)) for p in zip(*bbox)]
        
                formatted_dimensions = "{{x:{:.2f}, y:{:.2f}, z:{:.2f}}}".format(dimensions[0], dimensions[1], dimensions[2])  # Format dimensions

                output_file.write(f"{file_name_without_extension}, {formatted_dimensions}\n")

                # Remove the imported objects from the scene
                bpy.ops.object.select_all(action='SELECT')
                bpy.ops.object.delete()

# Close the text file
print(f"Data written to {output_file_path}")
