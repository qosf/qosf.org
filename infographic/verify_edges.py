#!/usr/bin/env python3
"""Verify that dynamically-computed edges == the original hardcoded ones."""

import yaml

with open('projects.yaml') as f:
    data = yaml.safe_load(f)

projects = data['projects']
rels = data['relationships']

# ── Hardcoded originals (from the first working version) ──────────
HARDCODED_CROSS = {
    ("openqasm","qiskit"), ("openqasm","cirq"), ("openqasm","tket"), ("openqasm","qdk"),
    ("tket","qiskit"), ("tket","cirq"), ("tket","pyquil"),
    ("mitiq","qiskit"), ("mitiq","cirq"), ("mitiq","pyquil"), ("mitiq","pennylane"),
    ("openfermion","cirq"), ("openfermion","projectq"), ("openfermion","pyquil"),
    ("cuquantum","qsim"), ("cuquantum","qiskit"), ("cuquantum","pennylane"),
    ("qdk","qiskit"), ("qdk","cirq"), ("qdk","openqasm"),
}

HARDCODED_SIM = {
    ("qiskit","qiskit_aer"), ("qiskit","cuquantum"),
    ("cirq","qsim"),
    ("pennylane","qulacs"), ("pennylane","cuquantum"),
}

def derive_hardware_edges(projects):
    """Same algorithm as in the JS deriveHardwareEdges."""
    edges = set()
    hw_map = {}
    for key, proj in projects.items():
        for hw in proj.get('hardware_backends', []):
            hw_map.setdefault(hw, []).append(key)
    for hw, keys in hw_map.items():
        if len(keys) < 2:
            continue
        for i in range(len(keys)):
            for j in range(i + 1, len(keys)):
                edge = tuple(sorted([keys[i], keys[j]]))
                edges.add(edge)
    return edges

# ── Dynamic from YAML ────────────────────────────────────────────
valid_nodes = set(projects.keys())

def dynamic_cross():
    edges = set()
    for entry in rels.get('cross_integrations', []):
        fr = entry['from']
        for tgt in entry.get('to', []):
            if fr in valid_nodes and tgt in valid_nodes:
                edges.add((fr, tgt))
    return edges

def dynamic_sim():
    edges = set()
    for entry in rels.get('sdk_simulator_connections', []):
        sdk = entry['sdk']
        for sim in entry.get('simulators', []):
            if sdk in valid_nodes and sim in valid_nodes:
                edges.add((sdk, sim))
    return edges

def dynamic_hw():
    return derive_hardware_edges(projects)

# ── Compare ───────────────────────────────────────────────────────
dc = dynamic_cross()
ds = dynamic_sim()
dh = dynamic_hw()

ok = True

# Cross-integrations
only_hc = HARDCODED_CROSS - dc
only_dc = dc - HARDCODED_CROSS
if only_hc or only_dc:
    print("✗ CROSS edges MISMATCH")
    if only_hc: print(f"  In hardcoded only: {only_hc}")
    if only_dc: print(f"  In dynamic only:  {only_dc}")
    ok = False
else:
    print(f"✓ Cross-integrations: {len(HARDCODED_CROSS)} edges match")

# Simulator
only_hs = HARDCODED_SIM - ds
only_ds = ds - HARDCODED_SIM
if only_hs or only_ds:
    print("✗ SIMULATOR edges MISMATCH")
    if only_hs: print(f"  In hardcoded only: {only_hs}")
    if only_ds: print(f"  In dynamic only:  {only_ds}")
    ok = False
else:
    print(f"✓ SDK↔Simulator: {len(HARDCODED_SIM)} edges match")

# Hardware (same algorithm, should be identical)
# Just report the count
print(f"✓ Shared hardware: {len(dh)} edges (same algorithm, no old constant to compare)")

print()
if ok:
    print("✅ All edge sets IDENTICAL — safe to replace hardcoded data with dynamic computation.")
else:
    print("❌ Mismatch found — investigate before proceeding.")
