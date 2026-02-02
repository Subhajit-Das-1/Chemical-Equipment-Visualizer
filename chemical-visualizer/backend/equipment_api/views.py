import pandas as pd
# from rest_framework.views import APIView
# from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
# from .models import Dataset
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from .models import Dataset
from .pdf_generator import generate_equipment_report

class HistoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        data = Dataset.objects.all().order_by('-id')[:5]
        return Response([d.summary for d in data])

class UploadCSV(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  # 🔴 THIS IS CRITICAL

    def post(self, request):
        file = request.FILES.get("file")

        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        filename = file.name

        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif filename.endswith('.xls') or filename.endswith('.xlsx'):
            df = pd.read_excel(file)
        else:
            return Response({"error": "Only CSV or Excel files allowed"}, status=400)

        summary = {
            "total_equipment": int(len(df)),
            "avg_flowrate": round(df["Flowrate"].mean(), 2),
            "avg_pressure": round(df["Pressure"].mean(), 2),
            "avg_temperature": round(df["Temperature"].mean(), 2),
            "type_distribution": df["Type"].value_counts().to_dict()
        }

        Dataset.objects.create(summary=summary)
        return Response(summary)


class GeneratePDFView(APIView):
    permission_classes = [IsAuthenticated]
    """Generate PDF report for a specific dataset"""
    
    def get(self, request, dataset_id):
        try:
            dataset = Dataset.objects.get(id=dataset_id)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=404)
        
        pdf_buffer = generate_equipment_report(dataset.summary, dataset_id)
        
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="equipment_report_{dataset_id}.pdf"'
        return response

