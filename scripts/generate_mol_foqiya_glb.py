import bpy
import bmesh
import math
import os

# Reset to factory empty
bpy.ops.wm.read_factory_settings(use_empty=True)

# ----------------------------------------------------
# MATERIALS CREATION
# ----------------------------------------------------
def create_mat(name, base_color, roughness=0.5, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat

mat_white_taqiya = create_mat("Mat_WhiteTaqiya", (0.97, 0.96, 0.94, 1.0), roughness=0.85, metallic=0.02)
mat_gold_sfifa = create_mat("Mat_GoldSfifa", (0.88, 0.70, 0.22, 1.0), roughness=0.22, metallic=0.88)
mat_aqqad_silk = create_mat("Mat_AqqadSilk", (0.95, 0.65, 0.10, 1.0), roughness=0.20, metallic=0.80)
mat_beard = create_mat("Mat_MoroccanBeard", (0.08, 0.06, 0.05, 1.0), roughness=0.88, metallic=0.03)
mat_amber_beads = create_mat("Mat_AmberBeads", (0.75, 0.35, 0.05, 1.0), roughness=0.12, metallic=0.35)
mat_green_silk = create_mat("Mat_GreenSilk", (0.02, 0.45, 0.25, 1.0), roughness=0.40, metallic=0.15)

# ----------------------------------------------------
# 1. MOROCCAN WHITE TAQIYA (طاقية فاسية بيضاء مقببة)
# ----------------------------------------------------
# Cranium apex at Z ≈ 2.364, center Y = +0.095
# UV Hemisphere dome: base at Z = 2.22, top at Z = 2.44
bm_taqiya = bmesh.new()
bmesh.ops.create_uvsphere(bm_taqiya, u_segments=32, v_segments=16, radius=0.535)
to_del = [v for v in bm_taqiya.verts if v.co.z < -0.01]
bmesh.ops.delete(bm_taqiya, geom=to_del, context='VERTS')
mesh_taqiya = bpy.data.meshes.new("Mesh_Taqiya")
bm_taqiya.to_mesh(mesh_taqiya)
bm_taqiya.free()

obj_taqiya = bpy.data.objects.new("MolFoqiya_Taqiya", mesh_taqiya)
obj_taqiya.scale = (1.0, 1.0, 0.42)
obj_taqiya.location = (0.0, 0.095, 2.22)
obj_taqiya.data.materials.append(mat_white_taqiya)
bpy.context.collection.objects.link(obj_taqiya)

# Bevel & Subsurf for smooth rounded fabric look
sub_taqiya = obj_taqiya.modifiers.new(name="Subsurf", type='SUBSURF')
sub_taqiya.levels = 2
sub_taqiya.render_levels = 2

# Golden Sfifa rim ring along the base
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.530,
    minor_radius=0.024,
    major_segments=36,
    minor_segments=12,
    location=(0.0, 0.095, 2.22)
)
obj_rim = bpy.context.active_object
obj_rim.name = "MolFoqiya_TaqiyaRim"
obj_rim.data.materials.append(mat_gold_sfifa)

# Apex knit button
bm_apex = bmesh.new()
bmesh.ops.create_cone(
    bm_apex,
    cap_ends=True,
    segments=20,
    radius1=0.055,
    radius2=0.065,
    depth=0.025
)
mesh_apex = bpy.data.meshes.new("Mesh_Apex")
bm_apex.to_mesh(mesh_apex)
bm_apex.free()

obj_apex = bpy.data.objects.new("MolFoqiya_Apex", mesh_apex)
obj_apex.location = (0.0, 0.095, 2.44)
obj_apex.data.materials.append(mat_gold_sfifa)
bpy.context.collection.objects.link(obj_apex)


# ----------------------------------------------------
# 2. AUTHENTIC MOROCCAN BEARD & MOUSTACHE (لحية وشارب مغربي أصيل)
# ----------------------------------------------------
# Pure Quad-Grid sculpted Moroccan beard wrapping full jawline from ear to ear
bm_beard = bmesh.new()

grid_pts = [
    # Row 0: Sideburns / upper jaw / under lip notch
    [(-0.58, -0.22, 1.80), (-0.28, -0.58, 1.62), (0.0, -0.70, 1.54), (0.28, -0.58, 1.62), (0.58, -0.22, 1.80)],
    # Row 1: Upper cheek to chin upper
    [(-0.54, -0.32, 1.66), (-0.28, -0.64, 1.48), (0.0, -0.76, 1.42), (0.28, -0.64, 1.48), (0.54, -0.32, 1.66)],
    # Row 2: Mid jaw corner to chin center
    [(-0.48, -0.44, 1.52), (-0.26, -0.68, 1.36), (0.0, -0.80, 1.30), (0.26, -0.68, 1.36), (0.48, -0.44, 1.52)],
    # Row 3: Lower jaw to chin lower
    [(-0.36, -0.58, 1.36), (-0.20, -0.74, 1.22), (0.0, -0.82, 1.18), (0.20, -0.74, 1.22), (0.36, -0.58, 1.36)],
    # Row 4: Moroccan spade tip (tapered bottom apex)
    [(-0.20, -0.68, 1.10), (-0.10, -0.78, 1.04), (0.0, -0.82, 1.02), (0.10, -0.78, 1.04), (0.20, -0.68, 1.10)],
]

# Front grid vertices
front_grid = []
for row in grid_pts:
    v_row = [bm_beard.verts.new(pt) for pt in row]
    front_grid.append(v_row)

# Back grid vertices (offset inward towards skin to create lush 3D volume)
back_grid = []
for row in grid_pts:
    v_row = []
    for pt in row:
        back_pt = (pt[0] * 0.93, pt[1] + 0.09, pt[2])
        v_row.append(bm_beard.verts.new(back_pt))
    back_grid.append(v_row)

num_rows = len(grid_pts)
num_cols = len(grid_pts[0])

# Front faces (quads)
for r in range(num_rows - 1):
    for c in range(num_cols - 1):
        bm_beard.faces.new([
            front_grid[r][c],
            front_grid[r+1][c],
            front_grid[r+1][c+1],
            front_grid[r][c+1]
        ])

# Back faces (quads, reversed winding)
for r in range(num_rows - 1):
    for c in range(num_cols - 1):
        bm_beard.faces.new([
            back_grid[r][c+1],
            back_grid[r+1][c+1],
            back_grid[r+1][c],
            back_grid[r][c]
        ])

# Boundary sides (left, right, bottom, top)
for r in range(num_rows - 1):
    bm_beard.faces.new([
        front_grid[r][0],
        back_grid[r][0],
        back_grid[r+1][0],
        front_grid[r+1][0]
    ])

for r in range(num_rows - 1):
    bm_beard.faces.new([
        front_grid[r+1][num_cols-1],
        back_grid[r+1][num_cols-1],
        back_grid[r][num_cols-1],
        front_grid[r][num_cols-1]
    ])

for c in range(num_cols - 1):
    bm_beard.faces.new([
        front_grid[num_rows-1][c],
        front_grid[num_rows-1][c+1],
        back_grid[num_rows-1][c+1],
        back_grid[num_rows-1][c]
    ])

for c in range(num_cols - 1):
    bm_beard.faces.new([
        front_grid[0][c+1],
        front_grid[0][c],
        back_grid[0][c],
        back_grid[0][c+1]
    ])

mesh_beard = bpy.data.meshes.new("Mesh_MoroccanBeard")
bm_beard.to_mesh(mesh_beard)
bm_beard.free()

obj_beard = bpy.data.objects.new("MolFoqiya_Beard", mesh_beard)
obj_beard.data.materials.append(mat_beard)
bpy.context.collection.objects.link(obj_beard)

# Apply Subdivision Surface Modifier (Level 2) -> Pure organic silk!
sub_beard = obj_beard.modifiers.new(name="Subsurf", type='SUBSURF')
sub_beard.levels = 2
sub_beard.render_levels = 2

# B. Soul Patch (العنفقة الفاسية)
bm_soul = bmesh.new()
bmesh.ops.create_uvsphere(
    bm_soul,
    u_segments=16,
    v_segments=12,
    radius=0.052
)
mesh_soul = bpy.data.meshes.new("Mesh_SoulPatch")
bm_soul.to_mesh(mesh_soul)
bm_soul.free()

obj_soul = bpy.data.objects.new("MolFoqiya_SoulPatch", mesh_soul)
obj_soul.location = (0.0, -0.71, 1.56)
obj_soul.scale = (0.75, 0.60, 1.10)
obj_soul.data.materials.append(mat_beard)
bpy.context.collection.objects.link(obj_soul)

# C. Moroccan Trim Moustache (الشارب المقوس الأنيق)
curve_data = bpy.data.curves.new('StacheCurve', type='CURVE')
curve_data.dimensions = '3D'
curve_data.bevel_depth = 0.035
curve_data.bevel_resolution = 6

polyline = curve_data.splines.new('BEZIER')
stache_pts = [
    (-0.20, -0.65, 1.64),
    (0.0,   -0.72, 1.68),
    (0.20,  -0.65, 1.64)
]
polyline.bezier_points.add(len(stache_pts) - 1)
for i, pt in enumerate(stache_pts):
    p = polyline.bezier_points[i]
    p.co = pt
    p.handle_left_type = 'AUTO'
    p.handle_right_type = 'AUTO'

obj_stache = bpy.data.objects.new("MolFoqiya_Moustache", curve_data)
obj_stache.data.materials.append(mat_beard)
bpy.context.collection.objects.link(obj_stache)


# ----------------------------------------------------
# 3. SFIFA & AQQAD BUTTONS (السفيفة والعقاد الذهبية)
# ----------------------------------------------------
bm_sfifa = bmesh.new()
bmesh.ops.create_cube(
    bm_sfifa,
    size=1.0
)
mesh_sfifa = bpy.data.meshes.new("Mesh_Sfifa")
bm_sfifa.to_mesh(mesh_sfifa)
bm_sfifa.free()

obj_sfifa = bpy.data.objects.new("MolFoqiya_Sfifa", mesh_sfifa)
obj_sfifa.location = (0.0, -0.72, 0.82)
obj_sfifa.scale = (0.09, 0.024, 0.65)
obj_sfifa.rotation_euler = (math.radians(-3.0), 0.0, 0.0)
obj_sfifa.data.materials.append(mat_gold_sfifa)
bpy.context.collection.objects.link(obj_sfifa)

# 8 Spherical Aqqad buttons along the ribbon
aqqad_zs = [1.10, 1.02, 0.94, 0.86, 0.78, 0.70, 0.62, 0.54]
for idx, z in enumerate(aqqad_zs):
    bm_btn = bmesh.new()
    bmesh.ops.create_uvsphere(bm_btn, u_segments=12, v_segments=10, radius=0.026)
    m_btn = bpy.data.meshes.new(f"Mesh_Aqqad_{idx}")
    bm_btn.to_mesh(m_btn)
    bm_btn.free()
    
    y_btn = -0.72 - (z - 0.82) * math.tan(math.radians(3.0)) - 0.018
    obj_btn = bpy.data.objects.new(f"MolFoqiya_Aqqad_{idx}", m_btn)
    obj_btn.location = (0.0, y_btn, z)
    obj_btn.data.materials.append(mat_aqqad_silk)
    bpy.context.collection.objects.link(obj_btn)


# ----------------------------------------------------
# 4. AMBER MISBAHA & GREEN SILK TASSEL (المسبحة والشوشة)
# ----------------------------------------------------
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.18,
    minor_radius=0.022,
    major_segments=28,
    minor_segments=10,
    location=(0.54, -0.15, 0.72),
    rotation=(math.radians(35.0), math.radians(50.0), 0.0)
)
obj_misbaha = bpy.context.active_object
obj_misbaha.name = "MolFoqiya_Misbaha"
obj_misbaha.data.materials.append(mat_amber_beads)

# Tassel cap (Gold)
bm_tcap = bmesh.new()
bmesh.ops.create_uvsphere(bm_tcap, u_segments=12, v_segments=10, radius=0.030)
mesh_tcap = bpy.data.meshes.new("Mesh_TasselCap")
bm_tcap.to_mesh(mesh_tcap)
bm_tcap.free()

obj_tcap = bpy.data.objects.new("MolFoqiya_TasselCap", mesh_tcap)
obj_tcap.location = (0.60, -0.22, 0.54)
obj_tcap.data.materials.append(mat_gold_sfifa)
bpy.context.collection.objects.link(obj_tcap)

# Tassel body (Green Silk Cone)
bm_tskirt = bmesh.new()
bmesh.ops.create_cone(
    bm_tskirt,
    cap_ends=True,
    segments=16,
    radius1=0.045,
    radius2=0.005,
    depth=0.15
)
mesh_tskirt = bpy.data.meshes.new("Mesh_TasselSkirt")
bm_tskirt.to_mesh(mesh_tskirt)
bm_tskirt.free()

obj_tskirt = bpy.data.objects.new("MolFoqiya_TasselSkirt", mesh_tskirt)
obj_tskirt.location = (0.60, -0.22, 0.44)
obj_tskirt.rotation_euler = (math.radians(180.0), 0.0, 0.0)
obj_tskirt.data.materials.append(mat_green_silk)
bpy.context.collection.objects.link(obj_tskirt)


# Enable smooth shading on all meshes
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True

# ----------------------------------------------------
# EXPORT TO GLB
# ----------------------------------------------------
project_dir = r"c:\Users\Bilal 26\Documents\VHS"
out_dir = os.path.join(project_dir, "public", "models", "accessories")
os.makedirs(out_dir, exist_ok=True)
out_glb = os.path.join(out_dir, "mol_foqiya_accessories.glb")

print(f"Exporting Mol Foqiya 3D accessories to: {out_glb}")
bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_colors=True,
    export_materials='EXPORT'
)

# Also copy directly to dist for local test servers if dist exists
dist_dir = os.path.join(project_dir, "dist", "models", "accessories")
if os.path.exists(os.path.join(project_dir, "dist")):
    os.makedirs(dist_dir, exist_ok=True)
    import shutil
    shutil.copy(out_glb, os.path.join(dist_dir, "mol_foqiya_accessories.glb"))
    print(f"Also synced to: {dist_dir}")

print(f"Successfully generated: {out_glb}, size: {os.path.getsize(out_glb)} bytes")
