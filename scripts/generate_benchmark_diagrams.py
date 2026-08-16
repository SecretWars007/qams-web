import os
import matplotlib.pyplot as plt
import numpy as np

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

# FIGURA 15: BENCHMARK MULTICRITERIO COMPARATIVO
def gen_benchmark_radar():
    categories = [
        'Conformidad ISTQB\n(6 Capítulos)',
        'Trazabilidad RTM\nBidireccional',
        'Pruebas Estáticas\n(Inspecciones)',
        'Pruebas Exploratorias\n(SBTM Charters)',
        'Tablero Kanban\nIntegrado',
        'Velocidad de Ejecución\n(Fast Runner)',
        'Eficiencia de Costos\n(TCO a 3 años)',
        'Soberanía de Datos\n(Self-Hosted Docker)',
        'Seguridad y Cifrado\n(AES-256 / RBAC)'
    ]
    
    N = len(categories)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1] # Cerrar polígono

    # Puntuaciones sobre 10
    qams_scores = [10, 10, 10, 10, 10, 9.5, 10, 10, 9.5]
    testrail_scores = [7.5, 8.0, 3.0, 5.0, 4.0, 7.0, 4.0, 6.0, 7.5]
    zephyr_scores = [7.0, 7.5, 2.0, 4.0, 6.5, 6.0, 3.5, 2.0, 7.0]
    testlink_scores = [6.0, 6.5, 1.0, 2.0, 1.0, 4.0, 9.0, 8.0, 4.0]

    qams_scores += qams_scores[:1]
    testrail_scores += testrail_scores[:1]
    zephyr_scores += zephyr_scores[:1]
    testlink_scores += testlink_scores[:1]

    fig, ax = plt.subplots(figsize=(9, 9), subplot_kw=dict(polar=True))

    plt.xticks(angles[:-1], categories, color='#1E293B', size=8.5, weight='bold')
    ax.set_rlabel_position(30)
    plt.yticks([2, 4, 6, 8, 10], ["2", "4", "6", "8", "10"], color="#64748B", size=8)
    plt.ylim(0, 10)

    # Trazar polígonos
    ax.plot(angles, qams_scores, linewidth=2.5, linestyle='solid', label='QAMS (Plataforma Propuesta)', color='#2563EB')
    ax.fill(angles, qams_scores, '#3B82F6', alpha=0.25)

    ax.plot(angles, testrail_scores, linewidth=1.5, linestyle='--', label='TestRail (Idera)', color='#F59E0B')
    ax.fill(angles, testrail_scores, '#F59E0B', alpha=0.1)

    ax.plot(angles, zephyr_scores, linewidth=1.5, linestyle='-.', label='Zephyr Scale (SmartBear)', color='#8B5CF6')
    ax.fill(angles, zephyr_scores, '#8B5CF6', alpha=0.1)

    ax.plot(angles, testlink_scores, linewidth=1.2, linestyle=':', label='TestLink (Open Source)', color='#64748B')
    ax.fill(angles, testlink_scores, '#64748B', alpha=0.05)

    plt.legend(loc='upper right', bbox_to_anchor=(1.25, 1.15), fontsize=8.5, frameon=True, facecolor='white', edgecolor='#CBD5E1')
    plt.title("Figura 15: Evaluación Benchmark Multicriterio de QAMS frente a Herramientas del Mercado", fontsize=11, weight='bold', pad=25)
    
    save_fig(fig, "figura15_benchmark_radar.png")

# FIGURA 16: COMPARACIÓN TCO (TOTAL COST OF OWNERSHIP A 5 AÑOS)
def gen_tco_comparison():
    fig, ax = plt.subplots(figsize=(10, 5))
    
    years = ['Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5']
    
    # Costos acumulados en USD para equipo de 15 testers
    zephyr_costs = [4500, 9000, 13500, 18000, 22500]
    testrail_costs = [6660, 13320, 19980, 26640, 33300]
    qams_costs = [420, 840, 1260, 1680, 2100] # Servidor VPS $35/mes
    
    x = np.arange(len(years))
    width = 0.25

    rects1 = ax.bar(x - width, testrail_costs, width, label='TestRail Server/Cloud ($37/user/mo)', color='#F59E0B', edgecolor='#D97706')
    rects2 = ax.bar(x, zephyr_costs, width, label='Zephyr Scale + Jira Plugin ($25/user/mo)', color='#8B5CF6', edgecolor='#7C3AED')
    rects3 = ax.bar(x + width, qams_costs, width, label='QAMS Fullstack (Self-Hosted VPS $35/mo)', color='#10B981', edgecolor='#059669')

    ax.set_ylabel('Costo Acumulado en USD ($)', weight='bold', fontsize=9, color='#1E293B')
    ax.set_title('Figura 16: Comparativa Financiera de Costo Total de Propiedad (TCO a 5 años - 15 Testers)', weight='bold', fontsize=11, pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(years, weight='bold', fontsize=9)
    ax.legend(fontsize=8.5, frameon=True)
    ax.grid(axis='y', linestyle='--', alpha=0.5)

    # Etiquetas de valor en barras de QAMS y TestRail
    for rect in rects3:
        height = rect.get_height()
        ax.annotate(f'${height}', xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=7.5, weight='bold', color='#065F46')

    save_fig(fig, "figura16_tco_comparison.png")

if __name__ == "__main__":
    print("Generando diagramas de benchmark y TCO...")
    gen_benchmark_radar()
    gen_tco_comparison()
    print("¡Diagramas de benchmark generados exitosamente!")
