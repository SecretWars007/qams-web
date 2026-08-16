import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['figure.dpi'] = 300

OUTPUT_DIR = r"C:\diplomado\qams-web\docs\diagrams"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def save_fig(fig, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    fig.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f"Generado: {filepath}")

# 1. FIGURA 13: ARQUITECTURA DE SEGURIDAD Y MATRIZ OWASP TOP 10
def gen_owasp_security():
    fig, ax = plt.subplots(figsize=(11, 7))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7.5)
    ax.axis('off')

    box_main = patches.FancyBboxPatch((0.5, 0.4), 10.0, 6.7, boxstyle="round,pad=0.1",
                                      fc='#F8FAFC', ec='#DC2626', lw=2)
    ax.add_patch(box_main)
    ax.text(5.5, 6.7, "ARQUITECTURA DE SEGURIDAD Y CUMPLIMIENTO OWASP TOP 10 (QAMS)",
            ha='center', weight='bold', color='#991B1B', fontsize=10.5)

    cards = [
        (0.8, 4.4, 4.4, 1.8, "A01: Broken Access Control & RBAC", "#FEF2F2", "#DC2626",
         "• Matriz RBAC dinámica en Backend y Frontend\n• Verificación granular de Claims en endpoints\n• Global Query Filters previenen fuga horizontal"),
        (5.8, 4.4, 4.4, 1.8, "A02: Cryptographic Failures & Cifrado", "#EFF6FF", "#2563EB",
         "• Cifrado AES-256-CBC en payloads de red\n• Hashing de contraseñas con BCrypt (salt >= 12)\n• Tokens JWT firmados con HMAC-SHA256"),
        (0.8, 2.4, 4.4, 1.8, "A03: Injection & Consultas Parametrizadas", "#F0FDF4", "#16A34A",
         "• EF Core 9 con consultas 100% parametrizadas\n• Prevención estricta de SQL/NoSQL Injection\n• Validaciones tipadas con FluentValidation"),
        (5.8, 2.4, 4.4, 1.8, "A05: Security Misconfiguration & Headers", "#FAF5FF", "#9333EA",
         "• Nginx Hardened con HSTS, X-Frame, CSP\n• Contenedores Docker con usuarios no-root\n• Desactivación de stack traces en producción"),
        (0.8, 0.6, 4.4, 1.6, "A07: Identification & Auth Failures", "#FEF3C7", "#D97706",
         "• Rotación segura de Refresh Tokens\n• Control de sesiones e invalidación de JWT\n• Rate limiting en login contra fuerza bruta"),
        (5.8, 0.6, 4.4, 1.6, "A09: Security Logging & Monitoring", "#F1F5F9", "#475569",
         "• Auditoría automática con IAuditable\n• Logs estructurados con Serilog en JSON\n• Alertas y monitoreo en segundo plano")
    ]

    for x, y, w, h, title, bg, border, desc in cards:
        r = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.06", fc=bg, ec=border, lw=1.5)
        ax.add_patch(r)
        ax.text(x+0.15, y+h-0.3, title, weight='bold', color=border, fontsize=7.8)
        ax.text(x+0.15, y+0.2, desc, fontsize=7, color='#1E293B')

    plt.title("Figura 13: Mapa de Mitigación y Cumplimiento OWASP Top 10 en QAMS", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura13_owasp_security.png")

# 2. FIGURA 14: NORMALIZACIÓN RELACIONAL (1FN, 2FN, 3FN)
def gen_normalization_diagram():
    fig, ax = plt.subplots(figsize=(11, 6))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 6)
    ax.axis('off')

    box_main = patches.FancyBboxPatch((0.5, 0.4), 10.0, 5.2, boxstyle="round,pad=0.1",
                                      fc='#F8FAFC', ec='#0284C7', lw=2)
    ax.add_patch(box_main)
    ax.text(5.5, 5.2, "PROCESO DE NORMALIZACIÓN RELACIONAL DEL ESQUEMA QAMS",
            ha='center', weight='bold', color='#0369A1', fontsize=10.5)

    steps = [
        (1.0, 1.0, 2.5, 3.6, "1. Primera Forma Normal\n(1FN: Atomicidad)", "#EFF6FF", "#1D4ED8",
         "• Eliminación de grupos repetitivos\n• Valores atómicos en cada celda\n• Definición de Clave Primaria (PK UUID)\n• Ejemplo: Pasos de prueba desagregados en tabla test_steps"),
        (4.25, 1.0, 2.5, 3.6, "2. Segunda Forma Normal\n(2FN: Dependencia Total)", "#F0FDF4", "#15803D",
         "• Cumple 1FN\n• Todo atributo no-clave depende funcionalmente de la PK completa\n• Eliminación de dependencias parciales\n• Ejemplo: Tabla puente requirement_test_cases"),
        (7.5, 1.0, 2.5, 3.6, "3. Tercera Forma Normal\n(3FN: Sin Transitividad)", "#FEF3C7", "#B45309",
         "• Cumple 2FN\n• Ningún atributo no-clave depende transitivamente de la PK\n• Separación de catálogos y roles\n• Ejemplo: Catalogs separados de test_cases y defects")
    ]

    for x, y, w, h, title, bg, border, desc in steps:
        r = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.06", fc=bg, ec=border, lw=1.5)
        ax.add_patch(r)
        ax.text(x+w/2, y+h-0.5, title, ha='center', weight='bold', color=border, fontsize=8)
        ax.text(x+0.15, y+0.4, desc, fontsize=7.2, color='#1E293B')

    # Flechas entre pasos
    ax.annotate('', xy=(4.25, 2.8), xytext=(3.5, 2.8),
                arrowprops=dict(facecolor='#0284C7', edgecolor='#0284C7', width=2, headwidth=6))
    ax.annotate('', xy=(7.5, 2.8), xytext=(6.75, 2.8),
                arrowprops=dict(facecolor='#0284C7', edgecolor='#0284C7', width=2, headwidth=6))

    plt.title("Figura 14: Fases de Normalización Relacional (1FN a 3FN) en la Base de Datos de QAMS", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura14_normalization.png")

if __name__ == "__main__":
    print("Generando diagramas de seguridad OWASP y normalización...")
    gen_owasp_security()
    gen_normalization_diagram()
    print("¡Diagramas adicionales generados exitosamente!")
