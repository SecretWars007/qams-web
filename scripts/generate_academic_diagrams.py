import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
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

# 1. FIGURA 1: ISHIKAWA
def gen_ishikawa():
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    ax.annotate('', xy=(9.2, 3), xytext=(0.5, 3),
                arrowprops=dict(facecolor='#1E293B', edgecolor='#1E293B', width=3, headwidth=10))
    
    box_prob = patches.FancyBboxPatch((7.6, 2.2), 2.2, 1.6, boxstyle="round,pad=0.1",
                                     fc='#EF4444', ec='#B91C1C', lw=2)
    ax.add_patch(box_prob)
    ax.text(8.7, 3.0, "INEFICIENCIA EN LA\nGESTIÓN DE QA Y\nFUGA DE DEFECTOS",
            ha='center', va='center', color='white', weight='bold', fontsize=9)

    # Personas
    ax.annotate('', xy=(3.0, 3.0), xytext=(1.5, 5.0), arrowprops=dict(edgecolor='#2563EB', width=2, headwidth=6))
    ax.text(1.5, 5.2, "PERSONAS", weight='bold', color='#1E40AF', fontsize=10, ha='center')
    ax.text(1.1, 4.3, "• Falta de especialización\n• Rotación de personal\n• Brechas de comunicación", fontsize=7.5)

    # Procesos
    ax.annotate('', xy=(5.5, 3.0), xytext=(4.0, 5.0), arrowprops=dict(edgecolor='#2563EB', width=2, headwidth=6))
    ax.text(4.0, 5.2, "PROCESOS", weight='bold', color='#1E40AF', fontsize=10, ha='center')
    ax.text(3.6, 4.3, "• Ausencia de estándar ISTQB\n• Pruebas tardías (No shift-left)\n• Sin criterios de salida (Quality Gates)", fontsize=7.5)

    # Métricas
    ax.annotate('', xy=(7.5, 3.0), xytext=(6.5, 5.0), arrowprops=dict(edgecolor='#2563EB', width=2, headwidth=6))
    ax.text(6.5, 5.2, "MÉTRICAS", weight='bold', color='#1E40AF', fontsize=10, ha='center')
    ax.text(6.0, 4.3, "• Sin trazabilidad RTM\n• Reportes manuales en Excel\n• Desconocimiento de DDP/DRE", fontsize=7.5)

    # Herramientas
    ax.annotate('', xy=(3.0, 3.0), xytext=(1.5, 1.0), arrowprops=dict(edgecolor='#0D9488', width=2, headwidth=6))
    ax.text(1.5, 0.7, "HERRAMIENTAS", weight='bold', color='#0F766E', fontsize=10, ha='center')
    ax.text(1.1, 1.8, "• Hojas de cálculo dispersas\n• Herramientas costosas (Jira/TestRail)\n• Sin tablero ágil integrado", fontsize=7.5)

    # Entorno
    ax.annotate('', xy=(5.5, 3.0), xytext=(4.0, 1.0), arrowprops=dict(edgecolor='#0D9488', width=2, headwidth=6))
    ax.text(4.0, 0.7, "ENTORNO / INFRAESTRUCTURA", weight='bold', color='#0F766E', fontsize=10, ha='center')
    ax.text(3.6, 1.8, "• Ambientes desincronizados\n• Sin contenedores reproducibles\n• Despliegues artesanales", fontsize=7.5)

    # Datos / Seguridad
    ax.annotate('', xy=(7.5, 3.0), xytext=(6.5, 1.0), arrowprops=dict(edgecolor='#0D9488', width=2, headwidth=6))
    ax.text(6.5, 0.7, "DATOS / SEGURIDAD", weight='bold', color='#0F766E', fontsize=10, ha='center')
    ax.text(6.0, 1.8, "• Sin control de acceso RBAC\n• Falta de auditoría de cambios\n• Datos sin cifrado en tránsito", fontsize=7.5)

    plt.title("Figura 1: Diagrama de Causa y Efecto (Ishikawa) de la Problemática de QA", fontsize=12, weight='bold', pad=15)
    save_fig(fig, "figura1_ishikawa.png")

# 2. FIGURA 2: STLC
def gen_stlc():
    fig, ax = plt.subplots(figsize=(11, 4.5))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 4)
    ax.axis('off')

    phases = [
        ("1. Planificación\nde Pruebas", "#3B82F6", "TestPlan, Objetivos,\nEstrategia, RBT"),
        ("2. Análisis y\nDiseño", "#8B5CF6", "Requisitos, RTM,\nCasos Clásicos/BDD"),
        ("3. Implementación\ny Configuración", "#EC4899", "Suites, Precondiciones,\nSUT & Ambientes"),
        ("4. Ejecución\nde Pruebas", "#F59E0B", "Fast Runner, Resultados,\nEvidencias, Defectos"),
        ("5. Evaluación y\nCierre", "#10B981", "Quality Gate, Summary\nReport, Métricas DRE")
    ]

    x_start = 0.5
    box_w = 2.2
    gap = 0.45

    for i, (title, color, desc) in enumerate(phases):
        x = x_start + i * (box_w + gap)
        rect = patches.FancyBboxPatch((x, 1.2), box_w, 2.0, boxstyle="round,pad=0.1",
                                      fc=color, ec='#1E293B', lw=1.5, alpha=0.9)
        ax.add_patch(rect)
        ax.text(x + box_w/2, 2.6, title, ha='center', va='center', color='white', weight='bold', fontsize=9.5)
        ax.text(x + box_w/2, 1.7, desc, ha='center', va='center', color='#F8FAFC', fontsize=7.5)

        if i < len(phases) - 1:
            ax.annotate('', xy=(x + box_w + gap - 0.05, 2.2), xytext=(x + box_w + 0.05, 2.2),
                        arrowprops=dict(facecolor='#475569', edgecolor='#475569', width=2, headwidth=6))

    bar = patches.FancyBboxPatch((0.5, 0.2), 13.0, 0.6, boxstyle="round,pad=0.08",
                                fc='#0F172A', ec='#334155', lw=1.5)
    ax.add_patch(bar)
    ax.text(7.0, 0.5, "ACTIVIDAD CONTINUA: Monitoreo, Control de Progreso, Gestión de Cambios y Trazabilidad (ISTQB)",
            ha='center', va='center', color='#38BDF8', weight='bold', fontsize=8.5)

    plt.title("Figura 2: Ciclo de Vida del Proceso de Pruebas (ISTQB CTFL v4.0 / QAMS Engine)", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura2_stlc.png")

# 3. FIGURA 3: PIRÁMIDE
def gen_pyramid():
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 9)
    ax.axis('off')

    pts = [[5, 8.5], [1, 1], [9, 1]]
    t_main = patches.Polygon(pts, closed=True, fc='#F1F5F9', ec='#334155', lw=2)
    ax.add_patch(t_main)

    pts1 = [[5, 8.5], [3.8, 6.2], [6.2, 6.2]]
    ax.add_patch(patches.Polygon(pts1, closed=True, fc='#EF4444', ec='#991B1B', lw=1.5))
    ax.text(5, 7.0, "Pruebas de Aceptación\ny E2E (UI Manual/Playwright)", ha='center', va='center', color='white', weight='bold', fontsize=8)

    pts2 = [[3.8, 6.2], [6.2, 6.2], [7.4, 3.8], [2.6, 3.8]]
    ax.add_patch(patches.Polygon(pts2, closed=True, fc='#F59E0B', ec='#B45309', lw=1.5))
    ax.text(5, 5.0, "Pruebas de Integración y API REST\n(xUnit + WebApplicationFactory)", ha='center', va='center', color='white', weight='bold', fontsize=8)

    pts3 = [[2.6, 3.8], [7.4, 3.8], [9, 1], [1, 1]]
    ax.add_patch(patches.Polygon(pts3, closed=True, fc='#10B981', ec='#047857', lw=1.5))
    ax.text(5, 2.4, "Pruebas Unitarias de Lógica de Dominio\n(Domain Rules, Services, Mappers, Signals)", ha='center', va='center', color='white', weight='bold', fontsize=8.5)

    ax.annotate('Mayor Costo &\nMayor Tiempo', xy=(1.5, 7.2), xytext=(0.5, 7.2),
                ha='right', va='center', fontsize=8, color='#B91C1C', weight='bold')
    ax.annotate('Mayor Rapidez &\nMenor Costo', xy=(1.0, 1.8), xytext=(0.2, 1.8),
                ha='right', va='center', fontsize=8, color='#047857', weight='bold')

    plt.title("Figura 3: Pirámide de Pruebas de Mike Cohn aplicada al Ecosistema QAMS", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura3_pyramid.png")

# 4. FIGURA 4: CASOS DE USO GENERAL
def gen_usecase_general():
    fig, ax = plt.subplots(figsize=(11, 7))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8)
    ax.axis('off')

    sys_rect = patches.FancyBboxPatch((2.8, 0.4), 6.0, 7.0, boxstyle="round,pad=0.1",
                                      fc='#F8FAFC', ec='#0284C7', lw=2, linestyle='--')
    ax.add_patch(sys_rect)
    ax.text(5.8, 7.1, "LÍMITES DEL SISTEMA QAMS (API & SPA)", ha='center', weight='bold', color='#0369A1', fontsize=9.5)

    def draw_actor(x, y, label, color='#1E293B'):
        ax.plot([x, x], [y-0.2, y+0.2], color=color, lw=2)
        ax.plot([x-0.15, x+0.15], [y, y], color=color, lw=2)
        ax.plot([x, x-0.15], [y-0.2, y-0.45], color=color, lw=2)
        ax.plot([x, x+0.15], [y-0.2, y-0.45], color=color, lw=2)
        circle = patches.Circle((x, y+0.3), 0.12, fc='white', ec=color, lw=2)
        ax.add_patch(circle)
        ax.text(x, y-0.65, label, ha='center', weight='bold', fontsize=8, color=color)

    draw_actor(1.2, 6.2, "Administrador\n(Admin)")
    draw_actor(1.2, 4.0, "Analista QA\n(Lead/Designer)")
    draw_actor(1.2, 1.8, "Tester Ejecutor\n(Runner)")
    draw_actor(9.8, 4.8, "Project Manager\n(PM)")
    draw_actor(9.8, 2.2, "Desarrollador\n(Dev Observer)")

    usecases = [
        (5.8, 6.3, "UC-01: Administrar Usuarios,\nRoles y Permisos RBAC", '#DBEAFE', '#1D4ED8'),
        (5.8, 5.3, "UC-02: Gestionar SUT,\nProyectos y Devoluciones", '#DBEAFE', '#1D4ED8'),
        (5.8, 4.3, "UC-03: Gestionar Requisitos\ny Matriz RTM", '#E0E7FF', '#4338CA'),
        (5.8, 3.3, "UC-04: Diseñar Planes, Suites\ny Casos (Clásicos/BDD)", '#E0E7FF', '#4338CA'),
        (5.8, 2.3, "UC-05: Ejecutar Pruebas,\nEvidencias y Defectos", '#FEF3C7', '#B45309'),
        (5.8, 1.2, "UC-06: Monitorear Dashboard,\nQuality Gates y Reportes", '#DCFCE7', '#15803D')
    ]

    for ux, uy, utxt, ufc, uec in usecases:
        ellipse = patches.Ellipse((ux, uy), 3.8, 0.75, fc=ufc, ec=uec, lw=1.5)
        ax.add_patch(ellipse)
        ax.text(ux, uy, utxt, ha='center', va='center', fontsize=7.5, weight='bold', color='#0F172A')

    ax.plot([1.4, 3.9], [6.2, 6.3], color='#64748B', lw=1.2)
    ax.plot([1.4, 3.9], [6.2, 5.3], color='#64748B', lw=1.2)
    ax.plot([1.4, 3.9], [4.0, 5.3], color='#64748B', lw=1.2)
    ax.plot([1.4, 3.9], [4.0, 4.3], color='#64748B', lw=1.2)
    ax.plot([1.4, 3.9], [4.0, 3.3], color='#64748B', lw=1.2)
    ax.plot([1.4, 3.9], [4.0, 2.3], color='#64748B', lw=1.2)
    ax.plot([1.4, 3.9], [1.8, 2.3], color='#64748B', lw=1.2)
    ax.plot([9.6, 7.7], [4.8, 5.3], color='#64748B', lw=1.2)
    ax.plot([9.6, 7.7], [4.8, 1.2], color='#64748B', lw=1.2)
    ax.plot([9.6, 7.7], [2.2, 2.3], color='#64748B', lw=1.2)
    ax.plot([9.6, 7.7], [2.2, 1.2], color='#64748B', lw=1.2)

    plt.title("Figura 4: Diagrama de Casos de Uso General del Sistema QAMS", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura4_usecases_general.png")

# 5. FIGURA 5A: DFD MÓDULO AUTENTICACIÓN Y SEGURIDAD
def gen_dfd_auth():
    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    # Entidad Externa
    rect_u = patches.Rectangle((0.5, 2.2), 1.8, 1.6, fc='#EFF6FF', ec='#1D4ED8', lw=2)
    ax.add_patch(rect_u)
    ax.text(1.4, 3.0, "USUARIO\n(Cliente Web)", ha='center', va='center', weight='bold', fontsize=8, color='#1E40AF')

    # Procesos
    p1 = patches.Circle((4.2, 4.3), 0.9, fc='#DBEAFE', ec='#1D4ED8', lw=1.5)
    ax.add_patch(p1)
    ax.text(4.2, 4.5, "1.1", ha='center', weight='bold', fontsize=9, color='#1E3A8A')
    ax.text(4.2, 4.1, "Validar y Cifrar\n(AES-256/BCrypt)", ha='center', fontsize=6.8, color='#1E3A8A')

    p2 = patches.Circle((4.2, 1.7), 0.9, fc='#DBEAFE', ec='#1D4ED8', lw=1.5)
    ax.add_patch(p2)
    ax.text(4.2, 1.9, "1.2", ha='center', weight='bold', fontsize=9, color='#1E3A8A')
    ax.text(4.2, 1.5, "Generar Tokens\n(JWT & Refresh)", ha='center', fontsize=6.8, color='#1E3A8A')

    # Almacenes de Datos (D1, D2)
    d1 = patches.Rectangle((7.5, 4.0), 2.0, 0.8, fc='#FEF3C7', ec='#B45309', lw=1.5)
    ax.add_patch(d1)
    ax.text(8.5, 4.4, "D1: users (PostgreSQL)", ha='center', va='center', weight='bold', fontsize=7.5, color='#92400E')

    d2 = patches.Rectangle((7.5, 1.4), 2.0, 0.8, fc='#FEE2E2', ec='#DC2626', lw=1.5)
    ax.add_patch(d2)
    ax.text(8.5, 1.8, "D2: roles_permissions", ha='center', va='center', weight='bold', fontsize=7.5, color='#991B1B')

    # Flujos
    ax.annotate('', xy=(3.3, 4.3), xytext=(2.3, 3.4), arrowprops=dict(facecolor='#1E40AF', width=1.5, headwidth=5))
    ax.text(2.6, 4.1, "Credenciales\nCifradas", fontsize=7, color='#1E40AF')

    ax.annotate('', xy=(7.5, 4.4), xytext=(5.1, 4.4), arrowprops=dict(facecolor='#1E40AF', width=1.5, headwidth=5))
    ax.text(6.3, 4.6, "Consulta Usuario", fontsize=7, color='#1E40AF', ha='center')

    ax.annotate('', xy=(4.2, 2.6), xytext=(4.2, 3.4), arrowprops=dict(facecolor='#1E40AF', width=1.5, headwidth=5))
    ax.text(4.7, 3.0, "Usuario Válido", fontsize=7, color='#1E40AF')

    ax.annotate('', xy=(7.5, 1.8), xytext=(5.1, 1.8), arrowprops=dict(facecolor='#1E40AF', width=1.5, headwidth=5))
    ax.text(6.3, 2.0, "Claims y Permisos", fontsize=7, color='#1E40AF', ha='center')

    ax.annotate('', xy=(2.3, 2.6), xytext=(3.3, 1.7), arrowprops=dict(facecolor='#1E40AF', width=1.5, headwidth=5))
    ax.text(2.6, 1.9, "JWT Token &\nUser Context", fontsize=7, color='#1E40AF')

    plt.title("Figura 5A: Diagrama de Flujo de Datos (DFD) — Módulo de Autenticación, RBAC y Cifrado", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura5a_dfd_auth.png")

# 6. FIGURA 5B: DFD MÓDULO EJECUCIÓN Y DEFECTOS
def gen_dfd_execution_defects():
    fig, ax = plt.subplots(figsize=(11, 6))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 6)
    ax.axis('off')

    rect_t = patches.Rectangle((0.5, 2.2), 1.8, 1.6, fc='#ECFDF5', ec='#059669', lw=2)
    ax.add_patch(rect_t)
    ax.text(1.4, 3.0, "TESTER\n(Fast Runner)", ha='center', va='center', weight='bold', fontsize=8, color='#065F46')

    # Procesos
    p1 = patches.Circle((4.5, 4.3), 0.9, fc='#FEF3C7', ec='#D97706', lw=1.5)
    ax.add_patch(p1)
    ax.text(4.5, 4.5, "2.1", ha='center', weight='bold', fontsize=9, color='#92400E')
    ax.text(4.5, 4.1, "Registrar Paso\n(Passed/Failed)", ha='center', fontsize=6.8, color='#92400E')

    p2 = patches.Circle((4.5, 1.7), 0.9, fc='#FEE2E2', ec='#DC2626', lw=1.5)
    ax.add_patch(p2)
    ax.text(4.5, 1.9, "2.2", ha='center', weight='bold', fontsize=9, color='#991B1B')
    ax.text(4.5, 1.5, "Gestionar Ticket\nde Defecto", ha='center', fontsize=6.8, color='#991B1B')

    # Almacenes
    d1 = patches.Rectangle((8.0, 4.0), 2.5, 0.8, fc='#FEF3C7', ec='#B45309', lw=1.5)
    ax.add_patch(d1)
    ax.text(9.25, 4.4, "D3: test_executions & steps", ha='center', va='center', weight='bold', fontsize=7.2, color='#92400E')

    d2 = patches.Rectangle((8.0, 1.4), 2.5, 0.8, fc='#FEE2E2', ec='#DC2626', lw=1.5)
    ax.add_patch(d2)
    ax.text(9.25, 1.8, "D4: defects & evidences", ha='center', va='center', weight='bold', fontsize=7.2, color='#991B1B')

    # Flujos
    ax.annotate('', xy=(3.6, 4.3), xytext=(2.3, 3.4), arrowprops=dict(facecolor='#059669', width=1.5, headwidth=5))
    ax.text(2.8, 4.1, "Atajo Teclado (P/F/B)", fontsize=7, color='#059669')

    ax.annotate('', xy=(8.0, 4.4), xytext=(5.4, 4.4), arrowprops=dict(facecolor='#D97706', width=1.5, headwidth=5))
    ax.text(6.7, 4.6, "Persistir Corrida", fontsize=7, color='#D97706', ha='center')

    ax.annotate('', xy=(4.5, 2.6), xytext=(4.5, 3.4), arrowprops=dict(facecolor='#DC2626', width=1.5, headwidth=5))
    ax.text(5.2, 3.0, "Si es FAILED", fontsize=7, color='#DC2626', weight='bold')

    ax.annotate('', xy=(8.0, 1.8), xytext=(5.4, 1.8), arrowprops=dict(facecolor='#DC2626', width=1.5, headwidth=5))
    ax.text(6.7, 2.0, "Crear Defecto + Evidencia", fontsize=7, color='#DC2626', ha='center')

    ax.annotate('', xy=(2.3, 2.6), xytext=(3.6, 1.7), arrowprops=dict(facecolor='#059669', width=1.5, headwidth=5))
    ax.text(2.8, 1.9, "Ticket Generado", fontsize=7, color='#059669')

    plt.title("Figura 5B: Diagrama de Flujo de Datos (DFD) — Módulo de Ejecución y Ciclo de Defectos", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura5b_dfd_execution.png")

# 7. FIGURA 6A: ARQUITECTURA DETALLADA BACKEND (.NET 9)
def gen_backend_detailed_arch():
    fig, ax = plt.subplots(figsize=(12, 7.5))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    # Contenedor Backend
    box_main = patches.FancyBboxPatch((0.5, 0.4), 11.0, 7.5, boxstyle="round,pad=0.1",
                                      fc='#F8FAFC', ec='#7C3AED', lw=2)
    ax.add_patch(box_main)
    ax.text(6.0, 7.5, "ARQUITECTURA DETALLADA DEL BACKEND (.NET 9 — CLEAN ARCHITECTURE)",
            ha='center', weight='bold', color='#6D28D9', fontsize=11)

    # 4 Capas Rectangulares Horizontales
    layers = [
        ("1. CAPA DE PRESENTACIÓN / API (QAMS.Api)", "#EDE9FE", "#6D28D9", 5.8, 1.3,
         "Controllers RESTful (Auth, Users, Projects, TestCases, Executions, Defects, Reviews, Reports) | Middleware GlobalException & Decryption | Swagger OpenAPI"),
        ("2. CAPA DE APLICACIÓN (QAMS.Application)", "#DDD6FE", "#7C3AED", 4.2, 1.3,
         "Application Services (UserService, TestCaseService, TestExecutionService, ReportService) | DTOs (Request/Response) | AutoMapper Profiles | FluentValidation"),
        ("3. CAPA DE INFRAESTRUCTURA (QAMS.Infrastructure)", "#C4B5FD", "#8B5CF6", 2.6, 1.3,
         "Persistence: QamsDbContext (EF Core 9) | Repositories (Generic & Specialized) | Redis Queue & Cache | SmtpEmailService | AES Encryption Service"),
        ("4. CAPA DE DOMINIO - CORE (QAMS.Domain)", "#A78BFA", "#4C1D95", 1.0, 1.3,
         "Domain Entities (Project, TestCase, TestStep, TestExecution, Defect, ReviewSession) | Value Objects | Interfaces (IAuditable, ISoftDelete) | Domain Exceptions")
    ]

    for title, bg, border, y, h, desc in layers:
        r = patches.FancyBboxPatch((0.8, y), 10.4, h, boxstyle="round,pad=0.06",
                                  fc=bg, ec=border, lw=1.5)
        ax.add_patch(r)
        ax.text(1.1, y+h-0.3, title, weight='bold', color=border, fontsize=8.5)
        ax.text(1.1, y+0.35, desc, fontsize=7.2, color='#1E293B', wrap=True)

    # Flechas de Dependencia hacia abajo
    for y_arrow in [5.8, 4.2, 2.6]:
        ax.annotate('', xy=(10.5, y_arrow), xytext=(10.5, y_arrow+0.4),
                    arrowprops=dict(facecolor='#6D28D9', edgecolor='#6D28D9', width=2, headwidth=6))

    ax.text(10.8, 4.2, "Regla de\nDependencia\nHacia el Core", ha='center', va='center', fontsize=7.5, weight='bold', color='#6D28D9')

    plt.title("Figura 6A: Diagrama de Arquitectura Detallada del Monolito Modular Backend (.NET 9)", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura6a_backend_detailed.png")

# 8. FIGURA 6B: ARQUITECTURA DETALLADA FRONTEND (ANGULAR 19)
def gen_frontend_detailed_arch():
    fig, ax = plt.subplots(figsize=(12, 7.5))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    box_main = patches.FancyBboxPatch((0.5, 0.4), 11.0, 7.5, boxstyle="round,pad=0.1",
                                      fc='#F8FAFC', ec='#DC2626', lw=2)
    ax.add_patch(box_main)
    ax.text(6.0, 7.5, "ARQUITECTURA DETALLADA DEL FRONTEND (ANGULAR 19 — STANDALONE & SIGNALS)",
            ha='center', weight='bold', color='#B91C1C', fontsize=11)

    layers = [
        ("1. CAPA DE PRESENTACIÓN / FEATURES (UI)", "#FEE2E2", "#DC2626", 5.8, 1.3,
         "Standalone Components: Dashboard, Requirements, TestCases, FastRunner, Defects, StaticReviews, Kanban, Admin | Tailwind CSS & Glassmorphism | Ng2-Charts"),
        ("2. CAPA DE ESTADO Y REACTIVIDAD (Store Layer)", "#FECACA", "#B91C1C", 4.2, 1.3,
         "Angular Signals Store: signal(), computed(), effect() | State reactivo centralizado | Inmutabilidad de modelos | Control de flujo @if, @for, @switch"),
        ("3. CAPA DE DOMINIO Y MAPEO (Core Mappers)", "#FCA5A5", "#991B1B", 2.6, 1.3,
         "Mappers Estáticos: TestCaseMapper.fromDto(), ProjectMapper.fromDto() | Validación Null-Safety y Parseo de Fechas | Type-Safe Domain Classes"),
        ("4. CAPA DE RED E INFRAESTRUCTURA (Services & Security)", "#F87171", "#7F1D1D", 1.0, 1.3,
         "HttpClient Services | AuthInterceptor (JWT Bearer) | EncryptionInterceptor (AES-256 CryptoJS) | ErrorHandlerInterceptor | Route Guards")
    ]

    for title, bg, border, y, h, desc in layers:
        r = patches.FancyBboxPatch((0.8, y), 10.4, h, boxstyle="round,pad=0.06",
                                  fc=bg, ec=border, lw=1.5)
        ax.add_patch(r)
        ax.text(1.1, y+h-0.3, title, weight='bold', color=border, fontsize=8.5)
        ax.text(1.1, y+0.35, desc, fontsize=7.2, color='#1E293B', wrap=True)

    for y_arrow in [5.8, 4.2, 2.6]:
        ax.annotate('', xy=(10.5, y_arrow), xytext=(10.5, y_arrow+0.4),
                    arrowprops=dict(facecolor='#DC2626', edgecolor='#DC2626', width=2, headwidth=6))

    ax.text(10.8, 4.2, "Flujo de Datos\nReactivo y\nDesacoplado", ha='center', va='center', fontsize=7.5, weight='bold', color='#DC2626')

    plt.title("Figura 6B: Diagrama de Arquitectura Detallada del Frontend (Angular 19)", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura6b_frontend_detailed.png")

# 9. FIGURA 8B: DESPLIEGUE ESPECÍFICO DEL FRONTEND
def gen_frontend_deployment():
    fig, ax = plt.subplots(figsize=(11, 6))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 6)
    ax.axis('off')

    # Browser
    b_rect = patches.FancyBboxPatch((0.5, 1.5), 2.5, 3.2, boxstyle="round,pad=0.08",
                                    fc='#EFF6FF', ec='#2563EB', lw=2)
    ax.add_patch(b_rect)
    ax.text(1.75, 4.3, "NAVEGADOR CLIENTE\n(Browser)", ha='center', weight='bold', fontsize=8.5, color='#1E40AF')
    ax.text(1.75, 2.6, "• HTML5 Single Page App\n• Runtime Angular (JS/CSS)\n• LocalStorage (JWT)\n• Caché de Assets", fontsize=7.2, color='#1E3A8A')

    # Servidor Nginx
    n_rect = patches.FancyBboxPatch((4.2, 1.0), 3.2, 4.2, boxstyle="round,pad=0.08",
                                    fc='#ECFDF5', ec='#059669', lw=2)
    ax.add_patch(n_rect)
    ax.text(5.8, 4.8, "CONTENEDOR NGINX\n(Puerto 4200:80)", ha='center', weight='bold', fontsize=8.5, color='#065F46')
    ax.text(5.8, 2.8, "• /usr/share/nginx/html\n• Bundle AOT (/dist/browser)\n• Compresión Gzip on\n• Fallback try_files $uri /index.html\n• Proxy Pass /api -> Backend", fontsize=7.2, color='#064E3B')

    # Backend
    k_rect = patches.FancyBboxPatch((8.2, 1.5), 2.4, 3.2, boxstyle="round,pad=0.08",
                                    fc='#F5F3FF', ec='#7C3AED', lw=2)
    ax.add_patch(k_rect)
    ax.text(9.4, 4.3, "API BACKEND\n(ASP.NET Core 9)", ha='center', weight='bold', fontsize=8.5, color='#6D28D9')
    ax.text(9.4, 2.6, "• Puerto 8080 (Interno)\n• Kestrel Server\n• Endpoints /api/*\n• JSON Responses", fontsize=7.2, color='#5B21B6')

    # Flechas
    ax.annotate('', xy=(4.2, 3.8), xytext=(3.0, 3.8), arrowprops=dict(facecolor='#2563EB', width=1.5, headwidth=5))
    ax.text(3.6, 4.1, "1. HTTP GET /", fontsize=7, color='#2563EB', ha='center')

    ax.annotate('', xy=(3.0, 3.2), xytext=(4.2, 3.2), arrowprops=dict(facecolor='#059669', width=1.5, headwidth=5))
    ax.text(3.6, 2.8, "2. Static Files (SPA)", fontsize=7, color='#059669', ha='center')

    ax.annotate('', xy=(8.2, 2.2), xytext=(7.4, 2.2), arrowprops=dict(facecolor='#7C3AED', width=1.5, headwidth=5))
    ax.text(7.8, 2.5, "3. Proxy /api", fontsize=7, color='#7C3AED', ha='center')

    plt.title("Figura 8B: Diagrama de Despliegue Específico del Frontend y Hosting con Nginx", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura8b_frontend_deployment.png")

# 10. FIGURA 9A: GOBERNANZA DE DATOS EN POSTGRESQL
def gen_data_governance():
    fig, ax = plt.subplots(figsize=(11, 6.5))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7)
    ax.axis('off')

    box_db = patches.FancyBboxPatch((0.5, 0.4), 10.0, 6.0, boxstyle="round,pad=0.1",
                                    fc='#F8FAFC', ec='#0284C7', lw=2)
    ax.add_patch(box_db)
    ax.text(5.5, 6.1, "ARQUITECTURA DE GOBERNANZA DE DATOS (POSTGRESQL 16 & EF CORE 9)",
            ha='center', weight='bold', color='#0369A1', fontsize=10)

    cards = [
        (0.8, 3.3, 4.4, 2.4, "1. Integridad Transaccional & ACID", "#EFF6FF", "#1D4ED8",
         "• Claves primarias UUID no predecibles\n• Claves foráneas ON DELETE RESTRICT\n• Restricciones de Unicidad (Email, Username, Code)\n• Transacciones atómicas Unit of Work"),
        (5.8, 3.3, 4.4, 2.4, "2. Auditoría y Linaje de Datos (Audit Trail)", "#F0FDF4", "#15803D",
         "• Interceptor automático SaveChangesAsync\n• CreatedAt & CreatedByUserId obligatorios\n• UpdatedAt & UpdatedByUserId en modificaciones\n• Histórico de cambios en ejecuciones"),
        (0.8, 0.7, 4.4, 2.3, "3. Ciclo de Vida y Soft-Delete", "#FEF3C7", "#B45309",
         "• Interfaz ISoftDelete (IsDeleted, DeletedAt)\n• Global Query Filters automáticos en EF Core\n• Prevención de borrado accidental de evidencias\n• Cumplimiento de retención documental"),
        (5.8, 0.7, 4.4, 2.3, "4. Seguridad, Aislamiento y Backup", "#FEE2E2", "#DC2626",
         "• Cifrado AES-256 en reposo para datos sensibles\n• Aislamiento multi-proyecto mediante RBAC\n• Políticas de Backup con scripts pg_dump\n• Indices B-Tree optimizados para consultas RTM")
    ]

    for x, y, w, h, title, bg, border, desc in cards:
        r = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.06", fc=bg, ec=border, lw=1.5)
        ax.add_patch(r)
        ax.text(x+0.2, y+h-0.35, title, weight='bold', color=border, fontsize=8)
        ax.text(x+0.2, y+0.25, desc, fontsize=7.2, color='#1E293B')

    plt.title("Figura 9A: Marco de Gobernanza de Datos y Persistencia Segura en QAMS", fontsize=11, weight='bold', pad=12)
    save_fig(fig, "figura9a_data_governance.png")

if __name__ == "__main__":
    print("Generando nuevos diagramas arquitectónicos y de flujo de datos...")
    gen_ishikawa()
    gen_stlc()
    gen_pyramid()
    gen_usecase_general()
    gen_dfd_auth()
    gen_dfd_execution_defects()
    gen_backend_detailed_arch()
    gen_frontend_detailed_arch()
    gen_frontend_deployment()
    gen_data_governance()
    print("¡Nuevos diagramas generados exitosamente!")
