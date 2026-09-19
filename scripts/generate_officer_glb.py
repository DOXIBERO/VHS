import bpy
import bmesh
import math
import os

# Reset to factory empty
bpy.ops.wm.read_factory_settings(use_empty=True)

# ----------------------------------------------------
# MATERIALS CREATION (PBR Principled BSDF)
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

mat_navy_wool = create_mat("Mat_NavyWool", (0.08, 0.16, 0.42, 1.0), roughness=0.55, metallic=0.05)
mat_gloss_black = create_mat("Mat_GlossBlack", (0.03, 0.03, 0.03, 1.0), roughness=0.08, metallic=0.75)
mat_gold_metal = create_mat("Mat_GoldMetal", (0.95, 0.78, 0.18, 1.0), roughness=0.15, metallic=0.95)
mat_silver_metal = create_mat("Mat_SilverMetal", (0.88, 0.90, 0.92, 1.0), roughness=0.12, metallic=0.96)
mat_dark_glass = create_mat("Mat_DarkGlass", (0.01, 0.01, 0.01, 1.0), roughness=0.02, metallic=0.98)
mat_white_shirt = create_mat("Mat_WhiteShirt", (0.96, 0.96, 0.97, 1.0), roughness=0.65, metallic=0.02)
mat_walkie_black = create_mat("Mat_WalkieBlack", (0.07, 0.07, 0.08, 1.0), roughness=0.70, metallic=0.10)

# ====================================================
# HEAD ACCESSORIES (Cranium apex Z ≈ 2.36, Center Y ≈ +0.095, Face at Y < 0)
# ====================================================

# 1. OFFICER PEAKED CAP (كاسكيطة البوليسي الملكية)
# Cap Crown (Flared top peaked cap, navy blue wool)
bm_cap = bmesh.new()
bmesh.ops.create_cone(
    bm_cap,
    cap_ends=True,
    segments=36,
    radius1=0.52,  # bottom band
    radius2=0.62,  # flared crown top
    depth=0.22
)
mesh_cap = bpy.data.meshes.new("Mesh_OfficerCapCrown")
bm_cap.to_mesh(mesh_cap)
bm_cap.free()

obj_cap = bpy.data.objects.new("Officer_CapCrown", mesh_cap)
obj_cap.location = (0.0, 0.06, 2.32)
obj_cap.rotation_euler = (math.radians(-8.0), 0.0, 0.0)
obj_cap.data.materials.append(mat_navy_wool)
bpy.context.collection.objects.link(obj_cap)

# Smooth Subsurf modifier for cap crown
sub_cap = obj_cap.modifiers.new(name="Subsurf", type='SUBSURF')
sub_cap.levels = 1
sub_cap.render_levels = 2

# Cap Band
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.525,
    minor_radius=0.025,
    major_segments=36,
    minor_segments=12,
    location=(0.0, 0.075, 2.22),
    rotation=(math.radians(-8.0), 0.0, 0.0)
)
obj_cap_band = bpy.context.active_object
obj_cap_band.name = "Officer_CapBand"
obj_cap_band.data.materials.append(mat_gloss_black)

# Cap Visor (Black patent gloss visor jutting forward over forehead)
bm_visor = bmesh.new()
v_verts = []
v_rows = 5
v_cols = 9
for r in range(v_rows):
    row_list = []
    t_r = r / (v_rows - 1)
    radius = 0.52 + t_r * 0.16
    z_drop = -t_r * 0.09 - (t_r ** 2) * 0.04
    for c in range(v_cols):
        t_c = (c / (v_cols - 1)) - 0.5
        angle = t_c * math.radians(110)
        x = math.sin(angle) * radius
        y = -math.cos(angle) * radius + 0.06
        z = 2.22 + z_drop - math.cos(angle * 1.5) * 0.02
        vert = bm_visor.verts.new((x, y, z))
        row_list.append(vert)
    v_verts.append(row_list)

bm_visor.verts.ensure_lookup_table()
for r in range(v_rows - 1):
    for c in range(v_cols - 1):
        bm_visor.faces.new([
            v_verts[r][c],
            v_verts[r+1][c],
            v_verts[r+1][c+1],
            v_verts[r][c+1]
        ])

mesh_visor = bpy.data.meshes.new("Mesh_OfficerVisor")
bm_visor.to_mesh(mesh_visor)
bm_visor.free()

obj_visor = bpy.data.objects.new("Officer_CapVisor", mesh_visor)
obj_visor.data.materials.append(mat_gloss_black)
bpy.context.collection.objects.link(obj_visor)

sol_v = obj_visor.modifiers.new(name="Solidify", type='SOLIDIFY')
sol_v.thickness = 0.022
sub_v = obj_visor.modifiers.new(name="Subsurf", type='SUBSURF')
sub_v.levels = 1

# Gold Chin Strap Cord
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.528,
    minor_radius=0.016,
    major_segments=36,
    minor_segments=10,
    location=(0.0, 0.055, 2.24),
    rotation=(math.radians(-4.0), 0.0, 0.0)
)
obj_cord = bpy.context.active_object
obj_cord.name = "Officer_CapCord"
obj_cord.data.materials.append(mat_gold_metal)

# Golden Police Star Badge on Front of Cap
bm_badge = bmesh.new()
star_r1 = 0.075
star_r2 = 0.040
pts = []
for i in range(16):
    r = star_r1 if i % 2 == 0 else star_r2
    a = i * (math.pi / 8)
    pts.append((math.cos(a) * r, math.sin(a) * r))

b_front = [bm_badge.verts.new((x, 0.012, y)) for x, y in pts]
b_back = [bm_badge.verts.new((x * 0.9, -0.005, y * 0.9)) for x, y in pts]
c_front = bm_badge.verts.new((0.0, 0.022, 0.0))
c_back = bm_badge.verts.new((0.0, -0.005, 0.0))

for i in range(16):
    ni = (i + 1) % 16
    bm_badge.faces.new([c_front, b_front[i], b_front[ni]])
    bm_badge.faces.new([c_back, b_back[ni], b_back[i]])
    bm_badge.faces.new([b_front[i], b_back[i], b_back[ni], b_front[ni]])

mesh_badge = bpy.data.meshes.new("Mesh_CapBadge")
bm_badge.to_mesh(mesh_badge)
bm_badge.free()

obj_badge = bpy.data.objects.new("Officer_CapBadge", mesh_badge)
obj_badge.location = (0.0, -0.51, 2.33)
obj_badge.rotation_euler = (math.radians(-12.0), 0.0, 0.0)
obj_badge.data.materials.append(mat_gold_metal)
bpy.context.collection.objects.link(obj_badge)


# 2. AVIATOR SUNGLASSES (نظارات البوليسي كحلة مذهبة)
bm_lens = bmesh.new()
bmesh.ops.create_cone(
    bm_lens,
    cap_ends=True,
    segments=24,
    radius1=0.13,
    radius2=0.08,
    depth=0.03
)
mesh_lens = bpy.data.meshes.new("Mesh_AviatorLens")
bm_lens.to_mesh(mesh_lens)
bm_lens.free()

obj_lens_l = bpy.data.objects.new("Officer_AviatorLensL", mesh_lens)
obj_lens_l.location = (-0.165, -0.535, 1.88)
obj_lens_l.scale = (1.1, 0.5, 1.25)
obj_lens_l.rotation_euler = (math.radians(88.0), math.radians(-14.0), math.radians(8.0))
obj_lens_l.data.materials.append(mat_dark_glass)
bpy.context.collection.objects.link(obj_lens_l)

mesh_lens_r = mesh_lens.copy()
obj_lens_r = bpy.data.objects.new("Officer_AviatorLensR", mesh_lens_r)
obj_lens_r.location = (0.165, -0.535, 1.88)
obj_lens_r.scale = (1.1, 0.5, 1.25)
obj_lens_r.rotation_euler = (math.radians(88.0), math.radians(14.0), math.radians(-8.0))
obj_lens_r.data.materials.append(mat_dark_glass)
bpy.context.collection.objects.link(obj_lens_r)

# Brow Bar & Nose Bridge
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.010,
    depth=0.48,
    location=(0.0, -0.542, 1.95),
    rotation=(0.0, math.radians(90.0), 0.0)
)
obj_brow = bpy.context.active_object
obj_brow.name = "Officer_AviatorBrowBar"
obj_brow.data.materials.append(mat_gold_metal)

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.008,
    depth=0.14,
    location=(0.0, -0.550, 1.88),
    rotation=(0.0, math.radians(90.0), 0.0)
)
obj_nose = bpy.context.active_object
obj_nose.name = "Officer_AviatorNoseBridge"
obj_nose.data.materials.append(mat_gold_metal)

# Temple Arms
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.008,
    depth=0.38,
    location=(-0.31, -0.38, 1.91),
    rotation=(math.radians(92.0), math.radians(-8.0), 0.0)
)
obj_temple_l = bpy.context.active_object
obj_temple_l.name = "Officer_AviatorTempleL"
obj_temple_l.data.materials.append(mat_gold_metal)

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.008,
    depth=0.38,
    location=(0.31, -0.38, 1.91),
    rotation=(math.radians(92.0), math.radians(8.0), 0.0)
)
obj_temple_r = bpy.context.active_object
obj_temple_r.name = "Officer_AviatorTempleR"
obj_temple_r.data.materials.append(mat_gold_metal)


# ====================================================
# CHEST ACCESSORIES (Upper torso Z ≈ 1.1 - 1.5, Front Y ≈ -0.58)
# ====================================================

# 1. SHIRT COLLAR & TIE
bm_collar = bmesh.new()
v0 = bm_collar.verts.new((-0.18, -0.54, 1.56))
v1 = bm_collar.verts.new((-0.03, -0.59, 1.48))
v2 = bm_collar.verts.new((-0.15, -0.57, 1.42))
bm_collar.faces.new([v0, v1, v2])

v3 = bm_collar.verts.new((0.18, -0.54, 1.56))
v4 = bm_collar.verts.new((0.15, -0.57, 1.42))
v5 = bm_collar.verts.new((0.03, -0.59, 1.48))
bm_collar.faces.new([v3, v4, v5])

mesh_collar = bpy.data.meshes.new("Mesh_ShirtCollar")
bm_collar.to_mesh(mesh_collar)
bm_collar.free()

obj_collar = bpy.data.objects.new("Officer_ShirtCollar", mesh_collar)
sol_c = obj_collar.modifiers.new(name="Solidify", type='SOLIDIFY')
sol_c.thickness = 0.018
obj_collar.data.materials.append(mat_white_shirt)
bpy.context.collection.objects.link(obj_collar)

# Police Black Tie
bm_tie = bmesh.new()
t_k0 = bm_tie.verts.new((-0.05, -0.60, 1.48))
t_k1 = bm_tie.verts.new((0.05, -0.60, 1.48))
t_k2 = bm_tie.verts.new((0.038, -0.605, 1.41))
t_k3 = bm_tie.verts.new((-0.038, -0.605, 1.41))
bm_tie.faces.new([t_k0, t_k1, t_k2, t_k3])

t_b0 = t_k3
t_b1 = t_k2
t_b2 = bm_tie.verts.new((0.055, -0.612, 1.15))
t_b3 = bm_tie.verts.new((0.0, -0.615, 1.07))
t_b4 = bm_tie.verts.new((-0.055, -0.612, 1.15))
bm_tie.faces.new([t_b0, t_b1, t_b2, t_b3, t_b4])

mesh_tie = bpy.data.meshes.new("Mesh_PoliceTie")
bm_tie.to_mesh(mesh_tie)
bm_tie.free()

obj_tie = bpy.data.objects.new("Officer_PoliceTie", mesh_tie)
sol_t = obj_tie.modifiers.new(name="Solidify", type='SOLIDIFY')
sol_t.thickness = 0.02
obj_tie.data.materials.append(mat_gloss_black)
bpy.context.collection.objects.link(obj_tie)

# Gold Tie Clip
bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(0.01, -0.628, 1.28),
    scale=(0.07, 0.012, 0.012)
)
obj_clip = bpy.context.active_object
obj_clip.name = "Officer_TieClip"
obj_clip.data.materials.append(mat_gold_metal)

# 2. POLICE CHEST BADGE (شارة الشرطة على الصدر)
bm_cbadge = bmesh.new()
s_pts = [
    (-0.045, 0.06), (0.045, 0.06), (0.045, 0.01),
    (0.025, -0.04), (0.0, -0.07), (-0.025, -0.04),
    (-0.045, 0.01)
]
s_verts = [bm_cbadge.verts.new((x, y, 0.0)) for x, y in s_pts]
bm_cbadge.faces.new(s_verts)

mesh_cbadge = bpy.data.meshes.new("Mesh_ChestBadge")
bm_cbadge.to_mesh(mesh_cbadge)
bm_cbadge.free()

obj_cbadge = bpy.data.objects.new("Officer_ChestBadge", mesh_cbadge)
obj_cbadge.location = (-0.24, -0.56, 1.36)
obj_cbadge.rotation_euler = (math.radians(10.0), math.radians(22.0), math.radians(-14.0))
sol_cb = obj_cbadge.modifiers.new(name="Solidify", type='SOLIDIFY')
sol_cb.thickness = 0.018
obj_cbadge.data.materials.append(mat_gold_metal)
bpy.context.collection.objects.link(obj_cbadge)

# 3. SHOULDER EPAULETS
bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(-0.44, -0.12, 1.58),
    scale=(0.12, 0.24, 0.035),
    rotation=(math.radians(12.0), math.radians(28.0), math.radians(-10.0))
)
obj_ep_l = bpy.context.active_object
obj_ep_l.name = "Officer_EpauletL"
obj_ep_l.data.materials.append(mat_navy_wool)

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.022,
    depth=0.02,
    location=(-0.39, -0.19, 1.63),
    rotation=(math.radians(12.0), math.radians(28.0), math.radians(-10.0))
)
obj_ep_btn_l = bpy.context.active_object
obj_ep_btn_l.name = "Officer_EpauletBtnL"
obj_ep_btn_l.data.materials.append(mat_gold_metal)

bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(0.44, -0.12, 1.58),
    scale=(0.12, 0.24, 0.035),
    rotation=(math.radians(12.0), math.radians(-28.0), math.radians(10.0))
)
obj_ep_r = bpy.context.active_object
obj_ep_r.name = "Officer_EpauletR"
obj_ep_r.data.materials.append(mat_navy_wool)

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.022,
    depth=0.02,
    location=(0.39, -0.19, 1.63),
    rotation=(math.radians(12.0), math.radians(-28.0), math.radians(10.0))
)
obj_ep_btn_r = bpy.context.active_object
obj_ep_btn_r.name = "Officer_EpauletBtnR"
obj_ep_btn_r.data.materials.append(mat_gold_metal)

# 4. DUTY BELT & BUCKLE
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.55,
    minor_radius=0.032,
    major_segments=36,
    minor_segments=12,
    location=(0.0, 0.0, 1.05)
)
obj_belt = bpy.context.active_object
obj_belt.name = "Officer_DutyBelt"
obj_belt.scale = (1.0, 1.04, 1.3)
obj_belt.data.materials.append(mat_gloss_black)

bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(0.0, -0.585, 1.05),
    scale=(0.11, 0.022, 0.08)
)
obj_buckle = bpy.context.active_object
obj_buckle.name = "Officer_BeltBuckle"
obj_buckle.data.materials.append(mat_silver_metal)

# 5. POLICE WALKIE-TALKIE RADIO
bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(0.54, -0.12, 1.12),
    scale=(0.065, 0.09, 0.16),
    rotation=(math.radians(5.0), math.radians(12.0), math.radians(18.0))
)
obj_radio = bpy.context.active_object
obj_radio.name = "Officer_WalkieTalkie"
obj_radio.data.materials.append(mat_walkie_black)

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.007,
    depth=0.22,
    location=(0.56, -0.14, 1.30),
    rotation=(math.radians(5.0), math.radians(12.0), math.radians(18.0))
)
obj_ant = bpy.context.active_object
obj_ant.name = "Officer_WalkieAntenna"
obj_ant.data.materials.append(mat_walkie_black)

# ====================================================
# EXPORT TO GLB
# ====================================================
out_dir = r"c:\Users\Bilal 26\Documents\VHS\public\models\accessories"
os.makedirs(out_dir, exist_ok=True)
out_glb = os.path.join(out_dir, "officer_accessories.glb")

print(f"Exporting Officer 3D accessories to: {out_glb}")
bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_yup=True
)

dist_dir = r"c:\Users\Bilal 26\Documents\VHS\dist\models\accessories"
if os.path.exists(r"c:\Users\Bilal 26\Documents\VHS\dist"):
    os.makedirs(dist_dir, exist_ok=True)
    import shutil
    shutil.copy2(out_glb, os.path.join(dist_dir, "officer_accessories.glb"))
    print(f"Also synced to: {dist_dir}")

print(f"Successfully generated: {out_glb}, size: {os.path.getsize(out_glb)} bytes")
