import bpy
import bmesh
import math
import os
import shutil

def get_or_create_mat(name, color, roughness=0.5, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat

def parent_to_armature_bone(obj, arm, bone_name):
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='POSE')
    arm.data.bones.active = arm.data.bones[bone_name]
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='BONE')


# ==============================================================================
# 1. BUILD COMPLETE OFFICER MODEL (fall_guy_officer.glb)
# ==============================================================================
def build_officer():
    print("\n================== BUILDING OFFICER MODEL ==================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath='public/models/characters/fall_guy.glb')

    arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
    arm.data.pose_position = 'REST'
    bpy.context.view_layer.update()

    body = bpy.data.objects['body']
    eye = bpy.data.objects['eye']
    hand = bpy.data.objects['hand-']
    leg = bpy.data.objects['leg']

    # Materials
    mat_navy = get_or_create_mat("Mat_OfficerNavy", (0.04, 0.08, 0.28, 1.0), roughness=0.45, metallic=0.08)
    mat_gloves = get_or_create_mat("Mat_WhiteGloves", (0.97, 0.97, 0.98, 1.0), roughness=0.40, metallic=0.02)
    mat_boots = get_or_create_mat("Mat_BlackBoots", (0.02, 0.02, 0.02, 1.0), roughness=0.10, metallic=0.85)

    mat_cap_wool = get_or_create_mat("Mat_CapWool", (0.04, 0.08, 0.28, 1.0), roughness=0.50, metallic=0.06)
    mat_patent_black = get_or_create_mat("Mat_PatentBlack", (0.015, 0.015, 0.015, 1.0), roughness=0.06, metallic=0.88)
    mat_gold = get_or_create_mat("Mat_OfficerGold", (0.95, 0.78, 0.15, 1.0), roughness=0.15, metallic=0.96)
    mat_silver = get_or_create_mat("Mat_OfficerSilver", (0.88, 0.90, 0.92, 1.0), roughness=0.12, metallic=0.96)
    mat_aviator_glass = get_or_create_mat("Mat_AviatorGlass", (0.005, 0.005, 0.005, 1.0), roughness=0.02, metallic=0.98)
    mat_white_shirt = get_or_create_mat("Mat_ShirtWhite", (0.96, 0.96, 0.97, 1.0), roughness=0.60, metallic=0.02)
    mat_walkie = get_or_create_mat("Mat_WalkieBlack", (0.06, 0.06, 0.07, 1.0), roughness=0.75, metallic=0.10)

    body.data.materials.clear()
    body.data.materials.append(mat_navy)
    hand.data.materials.clear()
    hand.data.materials.append(mat_gloves)
    leg.data.materials.clear()
    leg.data.materials.append(mat_boots)

    # --- Head Items (Z ≈ 2.36 skull apex, Eye Z ≈ 1.89, Y ≈ -0.58 front) ---
    # Cap Crown
    bm_cap = bmesh.new()
    bmesh.ops.create_cone(bm_cap, cap_ends=True, segments=36, radius1=0.53, radius2=0.64, depth=0.22)
    mesh_cap = bpy.data.meshes.new("Mesh_CapCrown")
    bm_cap.to_mesh(mesh_cap)
    bm_cap.free()
    obj_cap = bpy.data.objects.new("Officer_CapCrown", mesh_cap)
    obj_cap.location = (0.0, 0.04, 2.29)
    obj_cap.rotation_euler = (math.radians(-8.0), 0.0, 0.0)
    obj_cap.data.materials.append(mat_cap_wool)
    bpy.context.collection.objects.link(obj_cap)
    parent_to_armature_bone(obj_cap, arm, 'Head_C_jnt01_04')

    # Cap Band
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.53, minor_radius=0.025, major_segments=36, minor_segments=12,
        location=(0.0, 0.050, 2.20), rotation=(math.radians(-8.0), 0.0, 0.0)
    )
    obj_band = bpy.context.active_object
    obj_band.name = "Officer_CapBand"
    obj_band.data.materials.append(mat_patent_black)
    parent_to_armature_bone(obj_band, arm, 'Head_C_jnt01_04')

    # Visor
    bm_visor = bmesh.new()
    v_verts = []
    v_rows, v_cols = 5, 11
    for r in range(v_rows):
        row_list = []
        t_r = r / (v_rows - 1)
        radius = 0.53 + t_r * 0.17
        z_drop = -t_r * 0.09 - (t_r ** 2) * 0.04
        for c in range(v_cols):
            t_c = (c / (v_cols - 1)) - 0.5
            angle = t_c * math.radians(115)
            x = math.sin(angle) * radius
            y = -math.cos(angle) * radius + 0.04
            z = 2.20 + z_drop - math.cos(angle * 1.5) * 0.022
            vert = bm_visor.verts.new((x, y, z))
            row_list.append(vert)
        v_verts.append(row_list)
    bm_visor.verts.ensure_lookup_table()
    for r in range(v_rows - 1):
        for c in range(v_cols - 1):
            bm_visor.faces.new([v_verts[r][c], v_verts[r+1][c], v_verts[r+1][c+1], v_verts[r][c+1]])
    mesh_visor = bpy.data.meshes.new("Mesh_Visor")
    bm_visor.to_mesh(mesh_visor)
    bm_visor.free()
    obj_visor = bpy.data.objects.new("Officer_CapVisor", mesh_visor)
    obj_visor.data.materials.append(mat_patent_black)
    bpy.context.collection.objects.link(obj_visor)
    sol_v = obj_visor.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol_v.thickness = 0.022
    parent_to_armature_bone(obj_visor, arm, 'Head_C_jnt01_04')

    # Gold Chin Strap
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.535, minor_radius=0.015, major_segments=36, minor_segments=10,
        location=(0.0, 0.045, 2.22), rotation=(math.radians(-4.0), 0.0, 0.0)
    )
    obj_cord = bpy.context.active_object
    obj_cord.name = "Officer_CapCord"
    obj_cord.data.materials.append(mat_gold)
    parent_to_armature_bone(obj_cord, arm, 'Head_C_jnt01_04')

    # Cap Star Badge
    bm_badge = bmesh.new()
    pts = []
    for i in range(16):
        r = 0.075 if i % 2 == 0 else 0.040
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
    obj_badge.location = (0.0, -0.53, 2.30)
    obj_badge.rotation_euler = (math.radians(-12.0), 0.0, 0.0)
    obj_badge.data.materials.append(mat_gold)
    bpy.context.collection.objects.link(obj_badge)
    parent_to_armature_bone(obj_badge, arm, 'Head_C_jnt01_04')

    # Aviators (Eyeline Z = 1.89, Y = -0.58)
    bm_lens = bmesh.new()
    bmesh.ops.create_cone(bm_lens, cap_ends=True, segments=24, radius1=0.13, radius2=0.08, depth=0.03)
    mesh_lens = bpy.data.meshes.new("Mesh_AviatorLens")
    bm_lens.to_mesh(mesh_lens)
    bm_lens.free()

    obj_lens_l = bpy.data.objects.new("Officer_AviatorLensL", mesh_lens)
    obj_lens_l.location = (-0.165, -0.585, 1.89)
    obj_lens_l.scale = (1.1, 0.5, 1.25)
    obj_lens_l.rotation_euler = (math.radians(88.0), math.radians(-14.0), math.radians(8.0))
    obj_lens_l.data.materials.append(mat_aviator_glass)
    bpy.context.collection.objects.link(obj_lens_l)
    parent_to_armature_bone(obj_lens_l, arm, 'Head_C_jnt01_04')

    mesh_lens_r = mesh_lens.copy()
    obj_lens_r = bpy.data.objects.new("Officer_AviatorLensR", mesh_lens_r)
    obj_lens_r.location = (0.165, -0.585, 1.89)
    obj_lens_r.scale = (1.1, 0.5, 1.25)
    obj_lens_r.rotation_euler = (math.radians(88.0), math.radians(14.0), math.radians(-8.0))
    obj_lens_r.data.materials.append(mat_aviator_glass)
    bpy.context.collection.objects.link(obj_lens_r)
    parent_to_armature_bone(obj_lens_r, arm, 'Head_C_jnt01_04')

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.010, depth=0.48, location=(0.0, -0.592, 1.96), rotation=(0.0, math.radians(90.0), 0.0)
    )
    obj_brow = bpy.context.active_object
    obj_brow.name = "Officer_AviatorBrowBar"
    obj_brow.data.materials.append(mat_gold)
    parent_to_armature_bone(obj_brow, arm, 'Head_C_jnt01_04')

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.008, depth=0.14, location=(0.0, -0.60, 1.89), rotation=(0.0, math.radians(90.0), 0.0)
    )
    obj_nose = bpy.context.active_object
    obj_nose.name = "Officer_AviatorNoseBridge"
    obj_nose.data.materials.append(mat_gold)
    parent_to_armature_bone(obj_nose, arm, 'Head_C_jnt01_04')

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.008, depth=0.38, location=(-0.31, -0.42, 1.92), rotation=(math.radians(92.0), math.radians(-8.0), 0.0)
    )
    obj_temple_l = bpy.context.active_object
    obj_temple_l.name = "Officer_AviatorTempleL"
    obj_temple_l.data.materials.append(mat_gold)
    parent_to_armature_bone(obj_temple_l, arm, 'Head_C_jnt01_04')

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.008, depth=0.38, location=(0.31, -0.42, 1.92), rotation=(math.radians(92.0), math.radians(8.0), 0.0)
    )
    obj_temple_r = bpy.context.active_object
    obj_temple_r.name = "Officer_AviatorTempleR"
    obj_temple_r.data.materials.append(mat_gold)
    parent_to_armature_bone(obj_temple_r, arm, 'Head_C_jnt01_04')

    # --- Chest Items (Chest_C_jnt_02) ---
    # Collar
    bm_collar = bmesh.new()
    v0 = bm_collar.verts.new((-0.18, -0.56, 1.56))
    v1 = bm_collar.verts.new((-0.03, -0.61, 1.48))
    v2 = bm_collar.verts.new((-0.15, -0.59, 1.42))
    bm_collar.faces.new([v0, v1, v2])
    v3 = bm_collar.verts.new((0.18, -0.56, 1.56))
    v4 = bm_collar.verts.new((0.15, -0.59, 1.42))
    v5 = bm_collar.verts.new((0.03, -0.61, 1.48))
    bm_collar.faces.new([v3, v4, v5])
    mesh_collar = bpy.data.meshes.new("Mesh_Collar")
    bm_collar.to_mesh(mesh_collar)
    bm_collar.free()
    obj_collar = bpy.data.objects.new("Officer_ShirtCollar", mesh_collar)
    sol_c = obj_collar.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol_c.thickness = 0.018
    obj_collar.data.materials.append(mat_white_shirt)
    bpy.context.collection.objects.link(obj_collar)
    parent_to_armature_bone(obj_collar, arm, 'Chest_C_jnt_02')

    # Tie
    bm_tie = bmesh.new()
    t_k0 = bm_tie.verts.new((-0.05, -0.62, 1.48))
    t_k1 = bm_tie.verts.new((0.05, -0.62, 1.48))
    t_k2 = bm_tie.verts.new((0.038, -0.625, 1.41))
    t_k3 = bm_tie.verts.new((-0.038, -0.625, 1.41))
    bm_tie.faces.new([t_k0, t_k1, t_k2, t_k3])
    t_b0, t_b1 = t_k3, t_k2
    t_b2 = bm_tie.verts.new((0.055, -0.632, 1.15))
    t_b3 = bm_tie.verts.new((0.0, -0.635, 1.07))
    t_b4 = bm_tie.verts.new((-0.055, -0.632, 1.15))
    bm_tie.faces.new([t_b0, t_b1, t_b2, t_b3, t_b4])
    mesh_tie = bpy.data.meshes.new("Mesh_Tie")
    bm_tie.to_mesh(mesh_tie)
    bm_tie.free()
    obj_tie = bpy.data.objects.new("Officer_PoliceTie", mesh_tie)
    sol_t = obj_tie.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol_t.thickness = 0.02
    obj_tie.data.materials.append(mat_patent_black)
    bpy.context.collection.objects.link(obj_tie)
    parent_to_armature_bone(obj_tie, arm, 'Chest_C_jnt_02')

    # Tie Clip
    bpy.ops.mesh.primitive_cube_add(
        size=1.0, location=(0.01, -0.645, 1.28), scale=(0.07, 0.012, 0.012)
    )
    obj_clip = bpy.context.active_object
    obj_clip.name = "Officer_TieClip"
    obj_clip.data.materials.append(mat_gold)
    parent_to_armature_bone(obj_clip, arm, 'Chest_C_jnt_02')

    # Chest Badge
    bm_cbadge = bmesh.new()
    s_pts = [
        (-0.045, 0.06), (0.045, 0.06), (0.045, 0.01),
        (0.025, -0.04), (0.0, -0.07), (-0.025, -0.04), (-0.045, 0.01)
    ]
    s_verts = [bm_cbadge.verts.new((x, y, 0.0)) for x, y in s_pts]
    bm_cbadge.faces.new(s_verts)
    mesh_cbadge = bpy.data.meshes.new("Mesh_ChestBadge")
    bm_cbadge.to_mesh(mesh_cbadge)
    bm_cbadge.free()
    obj_cbadge = bpy.data.objects.new("Officer_ChestBadge", mesh_cbadge)
    obj_cbadge.location = (-0.24, -0.58, 1.36)
    obj_cbadge.rotation_euler = (math.radians(10.0), math.radians(22.0), math.radians(-14.0))
    sol_cb = obj_cbadge.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol_cb.thickness = 0.018
    obj_cbadge.data.materials.append(mat_gold)
    bpy.context.collection.objects.link(obj_cbadge)
    parent_to_armature_bone(obj_cbadge, arm, 'Chest_C_jnt_02')

    # Epaulets
    bpy.ops.mesh.primitive_cube_add(
        size=1.0, location=(-0.44, -0.12, 1.58), scale=(0.12, 0.24, 0.035),
        rotation=(math.radians(12.0), math.radians(28.0), math.radians(-10.0))
    )
    obj_ep_l = bpy.context.active_object
    obj_ep_l.name = "Officer_EpauletL"
    obj_ep_l.data.materials.append(mat_cap_wool)
    parent_to_armature_bone(obj_ep_l, arm, 'Chest_C_jnt_02')

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.022, depth=0.02, location=(-0.39, -0.19, 1.63),
        rotation=(math.radians(12.0), math.radians(28.0), math.radians(-10.0))
    )
    obj_ep_btn_l = bpy.context.active_object
    obj_ep_btn_l.name = "Officer_EpauletBtnL"
    obj_ep_btn_l.data.materials.append(mat_gold)
    parent_to_armature_bone(obj_ep_btn_l, arm, 'Chest_C_jnt_02')

    bpy.ops.mesh.primitive_cube_add(
        size=1.0, location=(0.44, -0.12, 1.58), scale=(0.12, 0.24, 0.035),
        rotation=(math.radians(12.0), math.radians(-28.0), math.radians(10.0))
    )
    obj_ep_r = bpy.context.active_object
    obj_ep_r.name = "Officer_EpauletR"
    obj_ep_r.data.materials.append(mat_cap_wool)
    parent_to_armature_bone(obj_ep_r, arm, 'Chest_C_jnt_02')

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.022, depth=0.02, location=(0.39, -0.19, 1.63),
        rotation=(math.radians(12.0), math.radians(-28.0), math.radians(10.0))
    )
    obj_ep_btn_r = bpy.context.active_object
    obj_ep_btn_r.name = "Officer_EpauletBtnR"
    obj_ep_btn_r.data.materials.append(mat_gold)
    parent_to_armature_bone(obj_ep_btn_r, arm, 'Chest_C_jnt_02')

    # Duty Belt & Buckle
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.55, minor_radius=0.032, major_segments=36, minor_segments=12,
        location=(0.0, 0.0, 1.05)
    )
    obj_belt = bpy.context.active_object
    obj_belt.name = "Officer_DutyBelt"
    obj_belt.scale = (1.0, 1.04, 1.3)
    obj_belt.data.materials.append(mat_patent_black)
    parent_to_armature_bone(obj_belt, arm, 'Pelvis_C_jnt_032')

    bpy.ops.mesh.primitive_cube_add(
        size=1.0, location=(0.0, -0.585, 1.05), scale=(0.11, 0.022, 0.08)
    )
    obj_buckle = bpy.context.active_object
    obj_buckle.name = "Officer_BeltBuckle"
    obj_buckle.data.materials.append(mat_silver)
    parent_to_armature_bone(obj_buckle, arm, 'Pelvis_C_jnt_032')

    # Walkie-Talkie
    bpy.ops.mesh.primitive_cube_add(
        size=1.0, location=(0.54, -0.12, 1.12), scale=(0.065, 0.09, 0.16),
        rotation=(math.radians(5.0), math.radians(12.0), math.radians(18.0))
    )
    obj_radio = bpy.context.active_object
    obj_radio.name = "Officer_WalkieTalkie"
    obj_radio.data.materials.append(mat_walkie)
    parent_to_armature_bone(obj_radio, arm, 'Pelvis_C_jnt_032')

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.007, depth=0.22, location=(0.56, -0.14, 1.30),
        rotation=(math.radians(5.0), math.radians(12.0), math.radians(18.0))
    )
    obj_ant = bpy.context.active_object
    obj_ant.name = "Officer_WalkieAntenna"
    obj_ant.data.materials.append(mat_walkie)
    parent_to_armature_bone(obj_ant, arm, 'Pelvis_C_jnt_032')

    # Switch back to POSE
    arm.data.pose_position = 'POSE'
    idle_act = [a for a in bpy.data.actions if 'idle' in a.name][0]
    arm.animation_data.action = idle_act

    # Export GLB
    out_glb = r"public/models/characters/fall_guy_officer.glb"
    bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB', export_yup=True)
    if os.path.exists("dist"):
        os.makedirs("dist/models/characters", exist_ok=True)
        shutil.copy2(out_glb, "dist/models/characters/fall_guy_officer.glb")
    print(f"Exported Officer GLB: {out_glb}, size: {os.path.getsize(out_glb)} bytes")


# ==============================================================================
# 2. BUILD COMPLETE MOL FOQIYA MODEL (fall_guy_mol_foqiya.glb)
# ==============================================================================
def build_mol_foqiya():
    print("\n================== BUILDING MOL FOQIYA MODEL ==================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath='public/models/characters/fall_guy.glb')

    arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
    arm.data.pose_position = 'REST'
    bpy.context.view_layer.update()

    body = bpy.data.objects['body']
    eye = bpy.data.objects['eye']
    hand = bpy.data.objects['hand-']
    leg = bpy.data.objects['leg']

    # Materials
    mat_ivory = get_or_create_mat("Mat_IvoryFoqiya", (0.97, 0.95, 0.92, 1.0), roughness=0.75, metallic=0.03)
    mat_tan_skin = get_or_create_mat("Mat_TanSkin", (0.83, 0.64, 0.45, 1.0), roughness=0.55, metallic=0.02)
    mat_yellow_shoe = get_or_create_mat("Mat_YellowBabouche", (0.96, 0.62, 0.05, 1.0), roughness=0.45, metallic=0.05)
    mat_dark_eyes = get_or_create_mat("Mat_DarkEyes", (0.05, 0.05, 0.05, 1.0), roughness=0.15, metallic=0.10)

    mat_taqiya_white = get_or_create_mat("Mat_TaqiyaWhite", (0.98, 0.97, 0.95, 1.0), roughness=0.85, metallic=0.02)
    mat_sfifa_gold = get_or_create_mat("Mat_GoldSfifa", (0.88, 0.70, 0.22, 1.0), roughness=0.22, metallic=0.88)
    mat_beard_dark = get_or_create_mat("Mat_MoroccanBeard", (0.08, 0.06, 0.05, 1.0), roughness=0.88, metallic=0.03)
    mat_amber = get_or_create_mat("Mat_AmberBeads", (0.75, 0.35, 0.05, 1.0), roughness=0.12, metallic=0.35)
    mat_green_silk = get_or_create_mat("Mat_GreenSilk", (0.02, 0.45, 0.25, 1.0), roughness=0.40, metallic=0.15)

    body.data.materials.clear()
    body.data.materials.append(mat_ivory)
    hand.data.materials.clear()
    hand.data.materials.append(mat_tan_skin)
    leg.data.materials.clear()
    leg.data.materials.append(mat_yellow_shoe)
    eye.data.materials.clear()
    eye.data.materials.append(mat_dark_eyes)

    # --- Head Items (Head_C_jnt01_04) ---
    # Taqiya Dome (Z ≈ 2.22 to 2.44)
    bm_taqiya = bmesh.new()
    bmesh.ops.create_uvsphere(bm_taqiya, u_segments=32, v_segments=16, radius=0.535)
    to_del = [v for v in bm_taqiya.verts if v.co.z < -0.01]
    bmesh.ops.delete(bm_taqiya, geom=to_del, context='VERTS')
    mesh_taqiya = bpy.data.meshes.new("Mesh_Taqiya")
    bm_taqiya.to_mesh(mesh_taqiya)
    bm_taqiya.free()
    obj_taqiya = bpy.data.objects.new("MolFoqiya_Taqiya", mesh_taqiya)
    obj_taqiya.scale = (1.0, 1.0, 0.42)
    obj_taqiya.location = (0.0, 0.05, 2.26)
    obj_taqiya.data.materials.append(mat_taqiya_white)
    bpy.context.collection.objects.link(obj_taqiya)
    sub_t = obj_taqiya.modifiers.new(name="Subsurf", type='SUBSURF')
    sub_t.levels = 1
    parent_to_armature_bone(obj_taqiya, arm, 'Head_C_jnt01_04')

    # Gold Rim
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.530, minor_radius=0.024, major_segments=36, minor_segments=12,
        location=(0.0, 0.05, 2.26)
    )
    obj_rim = bpy.context.active_object
    obj_rim.name = "MolFoqiya_TaqiyaRim"
    obj_rim.data.materials.append(mat_sfifa_gold)
    parent_to_armature_bone(obj_rim, arm, 'Head_C_jnt01_04')

    # Apex Button
    bm_apex = bmesh.new()
    bmesh.ops.create_cone(bm_apex, cap_ends=True, segments=20, radius1=0.055, radius2=0.065, depth=0.025)
    mesh_apex = bpy.data.meshes.new("Mesh_Apex")
    bm_apex.to_mesh(mesh_apex)
    bm_apex.free()
    obj_apex = bpy.data.objects.new("MolFoqiya_Apex", mesh_apex)
    obj_apex.location = (0.0, 0.05, 2.48)
    obj_apex.data.materials.append(mat_sfifa_gold)
    bpy.context.collection.objects.link(obj_apex)
    parent_to_armature_bone(obj_apex, arm, 'Head_C_jnt01_04')

    # Moroccan Beard & Moustache (Sculpted around chin Z = 1.35 to 1.75, Front Y = -0.58)
    bm_beard = bmesh.new()
    grid_pts = [
        [(-0.55, -0.22, 1.78), (-0.28, -0.58, 1.62), (0.0, -0.62, 1.54), (0.28, -0.58, 1.62), (0.55, -0.22, 1.78)],
        [(-0.50, -0.32, 1.64), (-0.28, -0.62, 1.48), (0.0, -0.66, 1.42), (0.28, -0.62, 1.48), (0.50, -0.32, 1.64)],
        [(-0.44, -0.42, 1.50), (-0.26, -0.65, 1.36), (0.0, -0.68, 1.30), (0.26, -0.65, 1.36), (0.44, -0.42, 1.50)],
        [(-0.32, -0.52, 1.36), (-0.20, -0.68, 1.22), (0.0, -0.70, 1.18), (0.20, -0.68, 1.22), (0.32, -0.52, 1.36)]
    ]
    verts_grid = []
    for row in grid_pts:
        row_verts = [bm_beard.verts.new(pt) for pt in row]
        verts_grid.append(row_verts)
    bm_beard.verts.ensure_lookup_table()
    for r in range(len(grid_pts) - 1):
        for c in range(len(grid_pts[0]) - 1):
            bm_beard.faces.new([verts_grid[r][c], verts_grid[r+1][c], verts_grid[r+1][c+1], verts_grid[r][c+1]])
    mesh_beard = bpy.data.meshes.new("Mesh_MoroccanBeard")
    bm_beard.to_mesh(mesh_beard)
    bm_beard.free()
    obj_beard = bpy.data.objects.new("MolFoqiya_Beard", mesh_beard)
    obj_beard.data.materials.append(mat_beard_dark)
    bpy.context.collection.objects.link(obj_beard)
    sol_b = obj_beard.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol_b.thickness = 0.045
    sub_b = obj_beard.modifiers.new(name="Subsurf", type='SUBSURF')
    sub_b.levels = 1
    parent_to_armature_bone(obj_beard, arm, 'Head_C_jnt01_04')

    # Soul Patch (عنفقة)
    bm_soul = bmesh.new()
    bmesh.ops.create_uvsphere(bm_soul, u_segments=16, v_segments=12, radius=0.065)
    mesh_soul = bpy.data.meshes.new("Mesh_SoulPatch")
    bm_soul.to_mesh(mesh_soul)
    bm_soul.free()
    obj_soul = bpy.data.objects.new("MolFoqiya_SoulPatch", mesh_soul)
    obj_soul.scale = (0.75, 0.40, 1.35)
    obj_soul.location = (0.0, -0.62, 1.48)
    obj_soul.data.materials.append(mat_beard_dark)
    bpy.context.collection.objects.link(obj_soul)
    parent_to_armature_bone(obj_soul, arm, 'Head_C_jnt01_04')

    # Moustache (شلاغم مقوسة)
    curve_data = bpy.data.curves.new('StacheCurve', type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = 0.038
    curve_data.bevel_resolution = 4
    polyline = curve_data.splines.new('BEZIER')
    polyline.bezier_points.add(2)
    pts_stache = [
        (-0.25, -0.56, 1.62),
        (0.0, -0.64, 1.68),
        (0.25, -0.56, 1.62)
    ]
    for i, pt in enumerate(pts_stache):
        polyline.bezier_points[i].co = pt
        polyline.bezier_points[i].handle_left_type = 'AUTO'
        polyline.bezier_points[i].handle_right_type = 'AUTO'
    obj_stache = bpy.data.objects.new("MolFoqiya_Moustache", curve_data)
    obj_stache.data.materials.append(mat_beard_dark)
    bpy.context.collection.objects.link(obj_stache)
    parent_to_armature_bone(obj_stache, arm, 'Head_C_jnt01_04')

    # --- Chest Items (Chest_C_jnt_02) ---
    # Sfifa Ribbon
    bm_sfifa = bmesh.new()
    sfifa_w = 0.045
    s_v0 = bm_sfifa.verts.new((-sfifa_w, -0.59, 1.55))
    s_v1 = bm_sfifa.verts.new((sfifa_w, -0.59, 1.55))
    s_v2 = bm_sfifa.verts.new((sfifa_w, -0.59, 1.05))
    s_v3 = bm_sfifa.verts.new((-sfifa_w, -0.59, 1.05))
    bm_sfifa.faces.new([s_v0, s_v1, s_v2, s_v3])
    mesh_sfifa = bpy.data.meshes.new("Mesh_Sfifa")
    bm_sfifa.to_mesh(mesh_sfifa)
    bm_sfifa.free()
    obj_sfifa = bpy.data.objects.new("MolFoqiya_Sfifa", mesh_sfifa)
    obj_sfifa.data.materials.append(mat_sfifa_gold)
    sol_s = obj_sfifa.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol_s.thickness = 0.015
    bpy.context.collection.objects.link(obj_sfifa)
    parent_to_armature_bone(obj_sfifa, arm, 'Chest_C_jnt_02')

    # 8 Aqqad Buttons
    for i in range(8):
        t = i / 7.0
        z_pos = 1.52 - t * 0.44
        bm_btn = bmesh.new()
        bmesh.ops.create_uvsphere(bm_btn, u_segments=12, v_segments=8, radius=0.024)
        mesh_btn = bpy.data.meshes.new(f"Mesh_Aqqad_{i}")
        bm_btn.to_mesh(mesh_btn)
        bm_btn.free()
        obj_btn = bpy.data.objects.new(f"MolFoqiya_Aqqad_{i}", mesh_btn)
        obj_btn.location = (0.0, -0.605, z_pos)
        obj_btn.data.materials.append(mat_sfifa_gold)
        bpy.context.collection.objects.link(obj_btn)
        parent_to_armature_bone(obj_btn, arm, 'Chest_C_jnt_02')

    # Amber Misbaha & Green Silk Tassel on Hip (Pelvis_C_jnt_032)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.12, minor_radius=0.018, major_segments=24, minor_segments=8,
        location=(0.42, -0.25, 0.95), rotation=(math.radians(35.0), math.radians(20.0), 0.0)
    )
    obj_misbaha = bpy.context.active_object
    obj_misbaha.name = "MolFoqiya_Misbaha"
    obj_misbaha.data.materials.append(mat_amber)
    parent_to_armature_bone(obj_misbaha, arm, 'Pelvis_C_jnt_032')

    bm_tassel = bmesh.new()
    bmesh.ops.create_cone(bm_tassel, cap_ends=True, segments=16, radius1=0.045, radius2=0.015, depth=0.15)
    mesh_tassel = bpy.data.meshes.new("Mesh_Tassel")
    bm_tassel.to_mesh(mesh_tassel)
    bm_tassel.free()
    obj_tassel = bpy.data.objects.new("MolFoqiya_Tassel", mesh_tassel)
    obj_tassel.location = (0.46, -0.28, 0.82)
    obj_tassel.data.materials.append(mat_green_silk)
    bpy.context.collection.objects.link(obj_tassel)
    parent_to_armature_bone(obj_tassel, arm, 'Pelvis_C_jnt_032')

    # Switch back to POSE
    arm.data.pose_position = 'POSE'
    idle_act = [a for a in bpy.data.actions if 'idle' in a.name][0]
    arm.animation_data.action = idle_act

    # Export GLB
    out_glb = r"public/models/characters/fall_guy_mol_foqiya.glb"
    bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB', export_yup=True)
    if os.path.exists("dist"):
        os.makedirs("dist/models/characters", exist_ok=True)
        shutil.copy2(out_glb, "dist/models/characters/fall_guy_mol_foqiya.glb")
    print(f"Exported Mol Foqiya GLB: {out_glb}, size: {os.path.getsize(out_glb)} bytes")

if __name__ == '__main__':
    build_officer()
    build_mol_foqiya()
    print("\nALL SKINS SUCCESSFULLY BUILT AND RIGGED!")
