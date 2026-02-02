from io import BytesIO
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER


def generate_equipment_report(summary_data, dataset_id=None):
    """
    Generate a PDF report for equipment summary data.
    
    Args:
        summary_data: dict containing equipment statistics
        dataset_id: optional dataset ID for the report
    
    Returns:
        BytesIO buffer containing the PDF
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        alignment=TA_CENTER,
        spaceAfter=30
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12
    )
    
    elements = []
    
    # Title
    elements.append(Paragraph("Chemical Equipment Report", title_style))
    elements.append(Spacer(1, 12))
    
    # Metadata
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if dataset_id:
        elements.append(Paragraph(f"<b>Dataset ID:</b> {dataset_id}", styles['Normal']))
    elements.append(Paragraph(f"<b>Generated:</b> {timestamp}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Summary Statistics
    elements.append(Paragraph("Summary Statistics", heading_style))
    
    stats_data = [
        ['Metric', 'Value'],
        ['Total Equipment', str(summary_data.get('total_equipment', 'N/A'))],
        ['Average Flowrate', str(summary_data.get('avg_flowrate', 'N/A'))],
        ['Average Pressure', str(summary_data.get('avg_pressure', 'N/A'))],
        ['Average Temperature', str(summary_data.get('avg_temperature', 'N/A'))],
    ]
    
    stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    elements.append(stats_table)
    elements.append(Spacer(1, 30))
    
    # Type Distribution
    type_dist = summary_data.get('type_distribution', {})
    if type_dist:
        elements.append(Paragraph("Equipment Type Distribution", heading_style))
        
        dist_data = [['Equipment Type', 'Count']]
        for eq_type, count in type_dist.items():
            dist_data.append([eq_type, str(count)])
        
        dist_table = Table(dist_data, colWidths=[3*inch, 2*inch])
        dist_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#27ae60')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#e8f8f0')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#a3d9b1')),
            ('FONTSIZE', (0, 1), (-1, -1), 11),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))
        elements.append(dist_table)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
