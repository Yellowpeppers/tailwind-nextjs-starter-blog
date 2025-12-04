import sys

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(*[int(c) for c in rgb])

def mix_color(c1, c2, weight):
    return tuple(c1[i] * weight + c2[i] * (1 - weight) for i in range(3))

def generate_palette(base_hex):
    base_rgb = hex_to_rgb(base_hex)
    white = (255, 255, 255)
    black = (0, 0, 0)

    palette = {}
    
    # Lighter shades (mixing with white)
    # Weights are approximate to match typical Tailwind progression
    palette[50] = rgb_to_hex(mix_color(white, base_rgb, 0.95))
    palette[100] = rgb_to_hex(mix_color(white, base_rgb, 0.9))
    palette[200] = rgb_to_hex(mix_color(white, base_rgb, 0.75))
    palette[300] = rgb_to_hex(mix_color(white, base_rgb, 0.6))
    palette[400] = rgb_to_hex(mix_color(white, base_rgb, 0.3))
    
    palette[500] = base_hex
    
    # Darker shades (mixing with black)
    palette[600] = rgb_to_hex(mix_color(base_rgb, black, 0.9))
    palette[700] = rgb_to_hex(mix_color(base_rgb, black, 0.75))
    palette[800] = rgb_to_hex(mix_color(base_rgb, black, 0.6))
    palette[900] = rgb_to_hex(mix_color(base_rgb, black, 0.45))
    palette[950] = rgb_to_hex(mix_color(base_rgb, black, 0.3))
    
    return palette

colors = {
    'Deep Navy Blue': '#0B1F3B',
    'Misty Indigo': '#3B3A82',
    'Cool Ink Green': '#0F6B61',
    'Sage Green': '#7A8F86',
    'Champagne Gold': '#C6A15B',
    'Terracotta Orange': '#B85C4A',
    'Graphite Gray': '#1F2933'
}

for name, hex_code in colors.items():
    print(f"--- {name} ({hex_code}) ---")
    p = generate_palette(hex_code)
    for k, v in p.items():
        print(f"{k}: {v}")
    print("")
