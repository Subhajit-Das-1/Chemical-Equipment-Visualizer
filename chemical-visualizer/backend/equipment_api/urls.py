from django.urls import path
from .views import UploadCSV, HistoryView, GeneratePDFView
from .auth_views import RegisterView, LoginView

urlpatterns = [
    path('upload/', UploadCSV.as_view(), name='upload-csv'),
    path('history/', HistoryView.as_view(), name='history'),
    path('report/<int:dataset_id>/', GeneratePDFView.as_view(), name='generate-pdf'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]

