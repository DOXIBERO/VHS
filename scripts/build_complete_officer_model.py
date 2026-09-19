import bpy
import bmesh
import math
import os

# Reset to factory empty
bpy.ops.wm.read_factory_settings(use_empty=True)

# 1. Import authentic Fall Guy GLB
in_glb = r"public/models/characters/fall_guy.glb"
bpy.ops.import_scene.gltf(filepath=in_glb)

arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
body = bpy.data.objects['body']
eye = bpy.data.objects['eye']
hand = bpy.data.objects['hand-']
leg = bpy.data.objects['leg']

# Helper to parent to bone keeping world transform
def parent_to_bone(obj, bone_name):
    bone = arm.pose.bones[bone_name]
    obj.parent = arm
    obj.parent_type = 'BONE'
    obj.parent_bone = bone_name
    obj.matrix_parent_inverse = (arm.matrix_world @ bone.matrix).inverted()

# Helper for PBR materials
def get_or_create_mat(name, color, roughness=0.5, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat

mat_officer_navy = get_or_create_mat("Mat_OfficerNavy", (0.04, 0.08, 0.28, 1.0), roughness=0.45, metallic=0.08)
mat_white_gloves = get_or_create_mat("Mat_WhiteGloves", (0.97, 0.97, 0.98, 1.0), roughness=0.40, metallic=0.02)
mat_black_boots = get_or_create_mat("Mat_BlackBoots", (0.02, 0.02, 0.02, 1.0), roughness=0.10, metallic=0.85)

mat_cap_wool = get_or_create_mat("Mat_CapWool", (0.04, 0.08, 0.28, 1.0), roughness=0.50, metallic=0.06)
mat_patent_black = get_or_create_mat("Mat_PatentBlack", (0.015, 0.015, 0.015, 1.0), roughness=0.06, metallic=0.88)
mat_gold = get_or_create_mat("Mat_OfficerGold", (0.95, 0.78, 0.15, 1.0), roughness=0.15, metallic=0.96)
mat_silver = get_or_create_mat("Mat_OfficerSilver", (0.88, 0.90, 0.92, 1.0), roughness=0.12, metallic=0.96)
mat_aviator_glass = get_or_create_mat("Mat_AviatorGlass", (0.005, 0.005, 0.005, 1.0), roughness=0.02, metallic=0.98)
mat_white_shirt = get_or_create_mat("Mat_ShirtWhite", (0.96, 0.96, 0.97, 1.0), roughness=0.60, metallic=0.02)
mat_walkie = get_or_create_mat("Mat_WalkieBlack", (0.06, 0.06, 0.07, 1.0), roughness=0.75, metallic=0.10)

# Set base character materials
body.data.materials.clear()
body.data.materials.append(mat_officer_navy)
hand.data.materials.clear()
hand.data.materials.append(mat_white_gloves)
leg.data.materials.clear()
leg.data.materials.append(mat_black_boots)

# ----------------------------------------------------
# 1. OFFICER PEAKED CAP (كاسكيطة البوليسي الفخمة)
# Skull top is at Z ≈ 2.295, Center Y ≈ 0.05
# ----------------------------------------------------
# Crown
bm_cap = bmesh.new()
bmesh.ops.create_cone(
    bm_cap,
    cap_ends=True,
    segments=36,
    radius1=0.54,
    radius2=0.65,
    depth=0.24
)
mesh_cap = bpy.data.meshes.new("Mesh_CapCrown")
bm_cap.to_mesh(mesh_cap)
bm_cap.free()
obj_cap = bpy.data.objects.new("Officer_CapCrown", mesh_cap)
obj_cap.location = (0.0, 0.04, 2.36)
obj_cap.rotation_euler = (math.radians(-8.0), 0.0, 0.0)
obj_cap.data.materials.append(mat_cap_wool)
bpy.context.collection.objects.link(obj_cap)
sub_c = obj_cap.modifiers.new(name="Subsurf", type='SUBSURF')
sub_c.levels = 1
parent_to_bone(obj_cap, 'Head_C_jnt01_04')

# Band
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.54,
    minor_radius=0.026,
    major_segments=36,
    minor_segments=12,
    location=(0.0, 0.055, 2.26),
    rotation=(math.radians(-8.0), 0.0, 0.0)
)
obj_band = bpy.context.active_object
obj_band.name = "Officer_CapBand"
obj_band.data.materials.append(mat_patent_black)
parent_to_bone(obj_band, 'Head_C_jnt01_04')

# Visor (Patent leather curved visor over brow)
bm_visor = bmesh.new()
v_verts = []
v_rows = 5
v_cols = 11
for r in range(v_rows):
    row_list = []
    t_r = r / (v_rows - 1)
    radius = 0.54 + t_r * 0.18
    z_drop = -t_r * 0.10 - (t_r ** 2) * 0.05
    for c in range(v_cols):
        t_c = (c / (v_cols - 1)) - 0.5
        angle = t_c * math.radians(115)
        x = math.sin(angle) * radius
        y = -math.cos(angle) * radius + 0.04
        z = 2.26 + z_drop - math.cos(angle * 1.5) * 0.025
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
mesh_visor = bpy.data.meshes.new("Mesh_Visor")
bm_visor.to_mesh(mesh_visor)
bm_visor.free()
obj_visor = bpy.data.objects.new("Officer_CapVisor", mesh_visor)
obj_visor.data.materials.append(mat_patent_black)
bpy.context.collection.objects.link(obj_visor)
sol_v = obj_visor.modifiers.new(name="Solidify", type='SOLIDIFY')
sol_v.thickness = 0.024
sub_v = obj_visor.modifiers.new(name="Subsurf", type='SUBSURF')
sub_v.levels = 1
parent_to_bone(obj_visor, 'Head_C_jnt01_04')

# Gold Chin Strap Cord
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.545,
    minor_radius=0.016,
    major_segments=36,
    minor_segments=10,
    location=(0.0, 0.045, 2.28),
    rotation=(math.radians(-4.0), 0.0, 0.0)
)
obj_cord = bpy.context.active_object
obj_cord.name = "Officer_CapCord"
obj_cord.data.materials.append(mat_gold)
parent_to_bone(obj_cord, 'Head_C_jnt01_04')

# Police 8-point Star Crest on front of Cap
bm_badge = bmesh.new()
pts = []
for i in range(16):
    r = 0.078 if i % 2 == 0 else 0.042
    a = i * (math.pi / 8)
    pts.append((math.cos(a) * r, math.sin(a) * r))
b_front = [bm_badge.verts.new((x, 0.012, y)) for x, y in pts]
b_back = [bm_badge.verts.new((x * 0.9, -0.005, y * 0.9)) for x, y in pts]
c_front = bm_badge.verts.new((0.0, 0.024, 0.0))
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
obj_badge.location = (0.0, -0.54, 2.37)
obj_badge.rotation_euler = (math.radians(-12.0), 0.0, 0.0)
obj_badge.data.materials.append(mat_gold)
bpy.context.collection.objects.link(obj_badge)
parent_to_bone(obj_badge, 'Head_C_jnt01_04')


# ----------------------------------------------------
# 2. POLICE AVIATOR SUNGLASSES (نظارات البوليسي كحلة مذهبة)
# Eye level is Z = 1.896, Y = -0.507
# ----------------------------------------------------
bm_lens = bmesh.new()
bmesh.ops.create_cone(
    bm_lens,
    cap_ends=True,
    segments=24,
    radius1=0.135,
    radius2=0.085,
    depth=0.03
)
mesh_lens = bpy.data.meshes.new("Mesh_AviatorLens")
bm_lens.to_mesh(mesh_lens)
bm_lens.free()

obj_lens_l = bpy.data.objects.new("Officer_AviatorLensL", mesh_lens)
obj_lens_l.location = (-0.165, -0.535, 1.895)
obj_lens_l.scale = (1.1, 0.5, 1.25)
obj_lens_l.rotation_euler = (math.radians(88.0), math.radians(-14.0), math.radians(8.0))
obj_lens_l.data.materials.append(mat_aviator_glass)
bpy.context.collection.objects.link(obj_lens_l)
parent_to_bone(obj_lens_l, 'Head_C_jnt01_04')

mesh_lens_r = mesh_lens.copy()
obj_lens_r = bpy.data.objects.new("Officer_AviatorLensR", mesh_lens_r)
obj_lens_r.location = (0.165, -0.535, 1.895)
obj_lens_r.scale = (1.1, 0.5, 1.25)
obj_lens_r.rotation_euler = (math.radians(88.0), math.radians(14.0), math.radians(-8.0))
obj_lens_r.data.materials.append(mat_aviator_glass)
bpy.context.collection.objects.link(obj_lens_r)
parent_to_bone(obj_lens_r, 'Head_C_jnt01_04')

# Brow Bar & Nose Bridge
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.010,
    depth=0.48,
    location=(0.0, -0.542, 1.965),
    rotation=(0.0, math.radians(90.0), 0.0)
)
obj_brow = bpy.context.active_object
obj_brow.name = "Officer_AviatorBrowBar"
obj_brow.data.materials.append(mat_gold)
parent_to_bone(obj_brow, 'Head_C_jnt01_04')

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.008,
    depth=0.14,
    location=(0.0, -0.550, 1.895),
    rotation=(0.0, math.radians(90.0), 0.0)
)
obj_nose = bpy.context.active_object
obj_nose.name = "Officer_AviatorNoseBridge"
obj_nose.data.materials.append(mat_gold)
parent_to_bone(obj_nose, 'Head_C_jnt01_04')

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.008,
    depth=0.38,
    location=(-0.31, -0.38, 1.925),
    rotation=(math.radians(92.0), math.radians(-8.0), 0.0)
)
obj_temple_l = bpy.context.active_object
obj_temple_l.name = "Officer_AviatorTempleL"
obj_temple_l.data.materials.append(mat_gold)
parent_to_bone(obj_temple_l, 'Head_C_jnt01_04')

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.008,
    depth=0.38,
    location=(0.31, -0.38, 1.925),
    rotation=(math.radians(92.0), math.radians(8.0), 0.0)
)
obj_temple_r = bpy.context.active_object
obj_temple_r.name = "Officer_AviatorTempleR"
obj_temple_r.data.materials.append(mat_gold)
parent_to_bone(obj_temple_r, 'Head_C_jnt01_04')


# ----------------------------------------------------
# 3. CHEST ACCESSORIES (Collar, Tie, Badge, Epaulets, Belt)
# Chest level is Z ≈ 1.1 - 1.5, Front Y ≈ -0.58
# ----------------------------------------------------
# Collar
bm_collar = bmesh.new()
v0 = bm_collar.verts.new((-0.18, -0.54, 1.56))
v1 = bm_collar.verts.new((-0.03, -0.59, 1.48))
v2 = bm_collar.verts.new((-0.15, -0.57, 1.42))
bm_collar.faces.new([v0, v1, v2])
v3 = bm_collar.verts.new((0.18, -0.54, 1.56))
v4 = bm_collar.verts.new((0.15, -0.57, 1.42))
v5 = bm_collar.verts.new((0.03, -0.59, 1.48))
bm_collar.faces.new([v3, v4, v5])
mesh_collar = bpy.data.meshes.new("Mesh_Collar")
bm_collar.to_mesh(mesh_collar)
bm_collar.free()
obj_collar = bpy.data.objects.new("Officer_ShirtCollar", mesh_collar)
sol_c = obj_collar.modifiers.new(name="Solidify", type='SOLIDIFY')
sol_c.thickness = 0.018
obj_collar.data.materials.append(mat_white_shirt)
bpy.context.collection.objects.link(obj_collar)
parent_to_bone(obj_collar, 'Chest_C_jnt_02')

# Tie
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
mesh_tie = bpy.data.meshes.new("Mesh_Tie")
bm_tie.to_mesh(mesh_tie)
bm_tie.free()
obj_tie = bpy.data.objects.new("Officer_PoliceTie", mesh_tie)
sol_t = obj_tie.modifiers.new(name="Solidify", type='SOLIDIFY')
sol_t.thickness = 0.02
obj_tie.data.materials.append(mat_patent_black)
bpy.context.collection.objects.link(obj_tie)
parent_to_bone(obj_tie, 'Chest_C_jnt_02')

# Tie Clip
bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(0.01, -0.628, 1.28),
    scale=(0.07, 0.012, 0.012)
)
obj_clip = bpy.context.active_object
obj_clip.name = "Officer_TieClip"
obj_clip.data.materials.append(mat_gold)
parent_to_bone(obj_clip, 'Chest_C_jnt_02')

# Police Chest Badge
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
obj_cbadge.data.materials.append(mat_gold)
bpy.context.collection.objects.link(obj_cbadge)
parent_to_bone(obj_cbadge, 'Chest_C_jnt_02')

# Epaulets
bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(-0.44, -0.12, 1.58),
    scale=(0.12, 0.24, 0.035),
    rotation=(math.radians(12.0), math.radians(28.0), math.radians(-10.0))
)
obj_ep_l = bpy.context.active_object
obj_ep_l.name = "Officer_EpauletL"
obj_ep_l.data.materials.append(mat_cap_wool)
parent_to_bone(obj_ep_l, 'Chest_C_jnt_02')

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.022,
    depth=0.02,
    location=(-0.39, -0.19, 1.63),
    rotation=(math.radians(12.0), math.radians(28.0), math.radians(-10.0))
)
obj_ep_btn_l = bpy.context.active_object
obj_ep_btn_l.name = "Officer_EpauletBtnL"
obj_ep_btn_l.data.materials.append(mat_gold)
parent_to_bone(obj_ep_btn_l, 'Chest_C_jnt_02')

bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(0.44, -0.12, 1.58),
    scale=(0.12, 0.24, 0.035),
    rotation=(math.radians(12.0), math.radians(-28.0), math.radians(10.0))
)
obj_ep_r = bpy.context.active_object
obj_ep_r.name = "Officer_EpauletR"
obj_ep_r.data.materials.append(mat_cap_wool)
parent_to_bone(obj_ep_r, 'Chest_C_jnt_02')

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.022,
    depth=0.02,
    location=(0.39, -0.19, 1.63),
    rotation=(math.radians(12.0), math.radians(-28.0), math.radians(10.0))
)
obj_ep_btn_r = bpy.context.active_object
obj_ep_btn_r.name = "Officer_EpauletBtnR"
obj_ep_btn_r.data.materials.append(mat_gold)
parent_to_bone(obj_ep_btn_r, 'Chest_C_jnt_02')

# Duty Belt & Buckle
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
obj_belt.data.materials.append(mat_patent_black)
parent_to_bone(obj_belt, 'Chest_C_jnt_02')

bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(0.0, -0.585, 1.05),
    scale=(0.11, 0.022, 0.08)
)
obj_buckle = bpy.context.active_object
obj_buckle.name = "Officer_BeltBuckle"
obj_buckle.data.materials.append(mat_silver)
parent_to_bone(obj_buckle, 'Chest_C_jnt_02')

# Walkie-Talkie
bpy.ops.mesh.primitive_cube_add(
    size=1.0,
    location=(0.54, -0.12, 1.12),
    scale=(0.065, 0.09, 0.16),
    rotation=(math.radians(5.0), math.radians(12.0), math.radians(18.0))
)
obj_radio = bpy.context.active_object
obj_radio.name = "Officer_WalkieTalkie"
obj_radio.data.materials.append(mat_walkie)
parent_to_bone(obj_radio, 'Chest_C_jnt_02')

bpy.ops.mesh.primitive_cylinder_add(
    radius=0.007,
    depth=0.22,
    location=(0.56, -0.14, 1.30),
    rotation=(math.radians(5.0), math.radians(12.0), math.radians(18.0))
)
obj_ant = bpy.context.active_object
obj_ant.name = "Officer_WalkieAntenna"
obj_ant.data.materials.append(mat_walkie)
parent_to_bone(obj_ant, 'Chest_C_jnt_02')

# ----------------------------------------------------
# 4. EXPORT TO GLB
# ----------------------------------------------------
out_glb = r"public/models/characters/fall_guy_officer.glb"
print(f"Exporting complete rigged Officer model to {out_glb}")
bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format='GLB',
    use_selection=False,
    export_apply=False, # Keep armature modifiers active
    export_yup=True
)

dist_glb = r"dist/models/characters/fall_guy_officer.glb"
if os.path.exists("dist"):
    os.makedirs(os.path.dirname(dist_glb), exist_ok=True)
    import shutil
    shutil.copy2(out_glb, dist_glb)
    print(f"Also synced to {dist_glb}")

print(f"Officer GLB size: {os.path.getsize(out_glb)} bytes")
