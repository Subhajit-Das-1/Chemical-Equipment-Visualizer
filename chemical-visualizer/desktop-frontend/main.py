import sys
import os
import requests
import json
import pandas as pd
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QPushButton, QLabel, QFileDialog, QTableWidget, QTableWidgetItem, 
    QHeaderView, QMessageBox, QFrame, QScrollArea, QStackedWidget,
    QLineEdit, QGridLayout, QSizePolicy
)
from PyQt5.QtCore import Qt, QSize, pyqtSignal
from PyQt5.QtGui import QFont, QIcon, QColor, QPalette, QLinearGradient, QBrush
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

API_BASE_URL = "https://chem-backend-2.onrender.com/api"

class ChartCanvas(FigureCanvas):
    def __init__(self, parent=None, width=5, height=4, dpi=100):
        self.fig = Figure(figsize=(width, height), dpi=dpi)
        self.axes = self.fig.add_subplot(111)
        self.fig.tight_layout()
        super(ChartCanvas, self).__init__(self.fig)

class StatsCard(QFrame):
    def __init__(self, title, value, icon="📊", color="#409eff"):
        super().__init__()
        self.setObjectName("StatsCard")
        self.setFixedSize(200, 100)
        self.setStyleSheet(f"""
            #StatsCard {{
                background-color: white;
                border-radius: 12px;
                border-left: 5px solid {color};
            }}
            QLabel {{ background: transparent; }}
        """)
        
        layout = QVBoxLayout(self)
        
        header_layout = QHBoxLayout()
        self.icon_label = QLabel(icon)
        self.icon_label.setStyleSheet("font-size: 20px;")
        self.title_label = QLabel(title)
        self.title_label.setStyleSheet("color: #909399; font-size: 12px; font-weight: bold;")
        header_layout.addWidget(self.icon_label)
        header_layout.addWidget(self.title_label)
        header_layout.addStretch()
        
        self.value_label = QLabel(value)
        self.value_label.setStyleSheet(f"font-size: 24px; font-weight: bold; color: {color};")
        
        layout.addLayout(header_layout)
        layout.addWidget(self.value_label)

class LoginDialog(QWidget):
    def __init__(self, controller):
        super().__init__()
        self.controller = controller
        self.setWindowTitle("Login - Chemical Visualizer")
        self.setFixedSize(400, 500)
        self.setStyleSheet("""
            QWidget { background-color: #f5f7fa; }
            #Card { background-color: white; border-radius: 20px; }
            QLineEdit { padding: 12px; border: 1px solid #dcdfe6; border-radius: 8px; font-size: 14px; background: white; }
            QLineEdit:focus { border-color: #409eff; }
            QPushButton { background-color: #409eff; color: white; border-radius: 8px; padding: 12px; font-weight: bold; font-size: 14px; }
            QPushButton:hover { background-color: #66b1ff; }
        """)
        
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(40, 40, 40, 40)
        
        self.card = QFrame()
        self.card.setObjectName("Card")
        card_layout = QVBoxLayout(self.card)
        card_layout.setContentsMargins(30, 40, 30, 40)
        card_layout.setSpacing(20)
        
        logo = QLabel("🧪")
        logo.setStyleSheet("font-size: 60px;")
        logo.setAlignment(Qt.AlignCenter)
        card_layout.addWidget(logo)
        
        title = QLabel("Chemical Visualizer")
        title.setStyleSheet("font-size: 24px; font-weight: bold; color: #303133;")
        title.setAlignment(Qt.AlignCenter)
        card_layout.addWidget(title)
        
        subtitle = QLabel("Sign in to your account")
        subtitle.setStyleSheet("color: #909399; font-size: 14px;")
        subtitle.setAlignment(Qt.AlignCenter)
        card_layout.addWidget(subtitle)
        
        self.username = QLineEdit()
        self.username.setPlaceholderText("Username")
        card_layout.addWidget(self.username)
        
        self.password = QLineEdit()
        self.password.setPlaceholderText("Password")
        self.password.setEchoMode(QLineEdit.Password)
        card_layout.addWidget(self.password)
        
        self.login_btn = QPushButton("Sign In")
        self.login_btn.setCursor(Qt.PointingHandCursor)
        card_layout.addWidget(self.login_btn)
        
        self.status = QLabel("")
        self.status.setStyleSheet("color: #f56c6c; font-size: 12px;")
        self.status.setAlignment(Qt.AlignCenter)
        card_layout.addWidget(self.status)
        
        main_layout.addWidget(self.card)
        
        self.login_btn.clicked.connect(self.handle_login)

    def handle_login(self):
        uname = self.username.text()
        pwd = self.password.text()
        
        if not uname or not pwd:
            self.status.setText("Please enter credentials")
            return
            
        try:
            self.login_btn.setEnabled(False)
            self.status.setText("Connecting...")
            response = requests.post(f"{API_BASE_URL}/login/", json={"username": uname, "password": pwd}, timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.controller.token = data['token']
                self.controller.username = data['username']
                self.close()
                self.controller.show_main()
            else:
                self.status.setText("Invalid username or password")
        except requests.exceptions.ConnectionError:
            self.status.setText("Error: Server is offline (Port 8000)")
        except requests.exceptions.Timeout:
            self.status.setText("Error: Connection timed out")
        except Exception as e:
            # Show a cleaner version of the error message
            msg = str(e)
            if "HTTPConnection object" in msg:
                msg = "Connection failed. Please check your internet/server."
            self.status.setText(f"Error: {msg[:50]}")
        finally:
            self.login_btn.setEnabled(True)

class NavButton(QPushButton):
    def __init__(self, text, icon_text, target_index, parent=None):
        super().__init__(parent)
        self.target_index = target_index
        self.setText(f"  {icon_text}   {text}")
        self.setCheckable(True)
        self.setFixedHeight(50)
        self.setCursor(Qt.PointingHandCursor)
        self.setStyleSheet("""
            QPushButton {
                background-color: transparent;
                color: #bfcbd9;
                border: none;
                text-align: left;
                padding-left: 20px;
                font-size: 14px;
                font-weight: 500;
            }
            QPushButton:hover {
                background-color: #263445;
                color: white;
            }
            QPushButton:checked {
                background-color: transparent;
                color: #409eff;
            }
        """)

class DesktopApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.token = None
        self.username = None
        
        self.setWindowTitle("Chemical Visualizer Dashboard")
        self.setMinimumSize(1200, 800)
        
        # Apply global styling
        self.setStyleSheet("""
            QMainWindow { background-color: #f0f2f5; }
            #Sidebar { background-color: #304156; min-width: 240px; max-width: 240px; }
            #ContentArea { background-color: #f0f2f5; }
            #Header { background-color: white; border-bottom: 1px solid #e6e6e6; min-height: 60px; max-height: 60px; }
            QScrollArea { border: none; background: transparent; }
            QTableWidget { background-color: white; border: 1px solid #e6e6e6; border-radius: 8px; gridline-color: #f0f0f0; }
            QHeaderView::section { background-color: #fafafa; padding: 12px; border: none; border-bottom: 1px solid #e6e6e6; font-weight: bold; color: #606266; }
        """)

        # Start with Login Dialog
        self.login_dialog = LoginDialog(self)
        self.login_dialog.show()

    def show_main(self):
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QHBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)

        # 1. Sidebar
        self.sidebar = QFrame()
        self.sidebar.setObjectName("Sidebar")
        sidebar_layout = QVBoxLayout(self.sidebar)
        sidebar_layout.setContentsMargins(0, 20, 0, 0)
        sidebar_layout.setSpacing(5)

        logo_label = QLabel("🧪 Visualizer")
        logo_label.setStyleSheet("color: white; font-size: 20px; font-weight: bold; margin: 20px; margin-bottom: 40px;")
        sidebar_layout.addWidget(logo_label)

        self.nav_group = []
        nav_items = [
            ("Dashboard", "🏠", 0),
            ("Upload Data", "📁", 1),
            ("History", "📜", 2),
            ("Reports", "📄", 3)
        ]

        for text, icon, idx in nav_items:
            btn = NavButton(text, icon, idx, self.sidebar)
            btn.clicked.connect(lambda checked, i=idx: self.switch_page(i))
            sidebar_layout.addWidget(btn)
            self.nav_group.append(btn)
        
        self.nav_group[0].setChecked(True)
        sidebar_layout.addStretch()

        user_info = QLabel(f"👤 {self.username}")
        user_info.setStyleSheet("color: #bfcbd9; padding: 20px; font-size: 14px; border-top: 1px solid #3d4d66;")
        sidebar_layout.addWidget(user_info)

        logout_btn = QPushButton("      🚪   Logout")
        logout_btn.setStyleSheet("QPushButton { background: transparent; color: #f56c6c; text-align: left; padding: 20px; border: none; } QPushButton:hover { background: #263445; }")
        logout_btn.clicked.connect(self.handle_logout)
        sidebar_layout.addWidget(logout_btn)

        self.main_layout.addWidget(self.sidebar)

        # 2. Right Side Content
        self.right_container = QWidget()
        right_layout = QVBoxLayout(self.right_container)
        right_layout.setContentsMargins(0, 0, 0, 0)
        right_layout.setSpacing(0)

        # Header
        self.header = QFrame()
        self.header.setObjectName("Header")
        header_layout = QHBoxLayout(self.header)
        header_layout.setContentsMargins(30, 0, 30, 0)
        
        self.page_title = QLabel("Dashboard Overview")
        self.page_title.setStyleSheet("font-size: 18px; font-weight: bold; color: #303133;")
        header_layout.addWidget(self.page_title)
        header_layout.addStretch()
        
        refresh_btn = QPushButton("🔄 Refresh")
        refresh_btn.setStyleSheet("background: white; color: #606266; border: 1px solid #dcdfe6; padding: 8px 15px;")
        refresh_btn.clicked.connect(self.refresh_data)
        header_layout.addWidget(refresh_btn)

        right_layout.addWidget(self.header)

        # Content Pages
        self.stacked_widget = QStackedWidget()
        self.setup_dashboard_page()
        self.setup_upload_page()
        self.setup_history_page()
        self.setup_reports_page()
        
        right_layout.addWidget(self.stacked_widget)
        self.main_layout.addWidget(self.right_container)

        self.show()
        self.refresh_data()

    def switch_page(self, index):
        self.stacked_widget.setCurrentIndex(index)
        for i, btn in enumerate(self.nav_group):
            btn.setChecked(i == index)
        
        titles = ["Dashboard Overview", "Upload Equipment Data", "Analysis History", "System Reports"]
        self.page_title.setText(titles[index])

    def setup_dashboard_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(30)

        # Stats Cards Grid
        stats_layout = QHBoxLayout()
        self.card_total = StatsCard("TOTAL ITEMS", "0", "📦", "#409eff")
        self.card_temp = StatsCard("AVG TEMP", "0°C", "🌡️", "#f56c6c")
        self.card_press = StatsCard("AVG PRESS", "0 bar", "💨", "#67c23a")
        self.card_flow = StatsCard("AVG FLOW", "0 m³/h", "🌊", "#e6a23c")
        
        stats_layout.addWidget(self.card_total)
        stats_layout.addWidget(self.card_temp)
        stats_layout.addWidget(self.card_press)
        stats_layout.addWidget(self.card_flow)
        stats_layout.addStretch()
        layout.addLayout(stats_layout)

        # Charts Area
        charts_scroll = QScrollArea()
        charts_scroll.setWidgetResizable(True)
        charts_content = QWidget()
        charts_layout = QGridLayout(charts_content)
        charts_layout.setSpacing(20)

        self.canvas_types = ChartCanvas(self)
        self.canvas_trends = ChartCanvas(self)
        
        charts_layout.addWidget(self.wrap_canvas(self.canvas_types, "Equipment Type Distribution"), 0, 0)
        charts_layout.addWidget(self.wrap_canvas(self.canvas_trends, "Parameter Trends (Latest)"), 0, 1)

        charts_scroll.setWidget(charts_content)
        layout.addWidget(charts_scroll)
        
        self.stacked_widget.addWidget(page)

    def wrap_canvas(self, canvas, title):
        frame = QFrame()
        frame.setStyleSheet("background-color: white; border-radius: 12px; border: 1px solid #e6e6e6;")
        layout = QVBoxLayout(frame)
        label = QLabel(title)
        label.setStyleSheet("font-weight: bold; color: #303133; padding: 10px;")
        layout.addWidget(label)
        layout.addWidget(canvas)
        return frame

    def setup_upload_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(100, 100, 100, 100)
        
        upload_frame = QFrame()
        upload_frame.setObjectName("UploadBox")
        upload_frame.setStyleSheet("""
            #UploadBox { background-color: white; border-radius: 20px; border: 2px dashed #dcdfe6; }
            #UploadBox:hover { border-color: #409eff; }
        """)
        vbox = QVBoxLayout(upload_frame)
        vbox.setSpacing(20)
        
        icon = QLabel("📊")
        icon.setStyleSheet("font-size: 80px;")
        icon.setAlignment(Qt.AlignCenter)
        vbox.addWidget(icon)
        
        desc = QLabel("Drag and Drop CSV files here or click to browse")
        desc.setStyleSheet("color: #606266; font-size: 16px;")
        desc.setAlignment(Qt.AlignCenter)
        vbox.addWidget(desc)
        
        self.upload_btn = QPushButton("Browse Files")
        self.upload_btn.setFixedSize(200, 50)
        self.upload_btn.setCursor(Qt.PointingHandCursor)
        vbox.addWidget(self.upload_btn, alignment=Qt.AlignCenter)
        
        self.status_label = QLabel("")
        self.status_label.setAlignment(Qt.AlignCenter)
        vbox.addWidget(self.status_label)
        
        layout.addWidget(upload_frame)
        self.upload_btn.clicked.connect(self.handle_upload)
        self.stacked_widget.addWidget(page)

    def setup_history_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(30, 30, 30, 30)
        
        self.table = QTableWidget()
        self.table.setColumnCount(6)
        self.table.setHorizontalHeaderLabels(["ID", "Items", "Avg Flow", "Avg Press", "Avg Temp", "Action"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.setAlternatingRowColors(True)
        self.table.setShowGrid(False)
        layout.addWidget(self.table)
        
        self.stacked_widget.addWidget(page)

    def setup_reports_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(30, 30, 30, 30)
        
        hint = QLabel("Select an entry from the History tab to generate a PDF report.")
        hint.setStyleSheet("font-size: 16px; color: #909399;")
        hint.setAlignment(Qt.AlignCenter)
        layout.addWidget(hint)
        
        self.stacked_widget.addWidget(page)

    def get_headers(self):
        return {"Authorization": f"Token {self.token}"} if self.token else {}

    def handle_upload(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open CSV", "", "CSV Files (*.csv);;Excel Files (*.xlsx *.xls)")
        if not file_path: return
            
        try:
            self.status_label.setText("🚀 Uploading...")
            with open(file_path, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{API_BASE_URL}/upload/", files=files, headers=self.get_headers())
            
            if response.status_code == 200:
                QMessageBox.information(self, "Success", "File analyzed successfully!")
                self.refresh_data()
                self.switch_page(0)
            else:
                QMessageBox.warning(self, "Error", f"Upload failed: {response.text}")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Request failed: {str(e)}")
        finally:
            self.status_label.setText("")

    def refresh_data(self):
        if not self.token: return
        try:
            response = requests.get(f"{API_BASE_URL}/history/", headers=self.get_headers())
            if response.status_code == 200:
                data = response.json()
                self.update_table(data)
                if data:
                    self.update_dashboard(data[0])
        except Exception as e:
            print(f"Failed to fetch history: {e}")

    def update_table(self, data):
        self.table.setRowCount(len(data))
        for row, item in enumerate(data):
            real_id = len(data) - row # Simplified ID for display
            self.table.setItem(row, 0, QTableWidgetItem(f"D-{real_id}"))
            self.table.setItem(row, 1, QTableWidgetItem(str(item.get('total_equipment', '0'))))
            self.table.setItem(row, 2, QTableWidgetItem(str(item.get('avg_flowrate', '0'))))
            self.table.setItem(row, 3, QTableWidgetItem(str(item.get('avg_pressure', '0'))))
            self.table.setItem(row, 4, QTableWidgetItem(str(item.get('avg_temperature', '0'))))
            
            # Action button for PDF
            btn = QPushButton("📥 PDF")
            btn.setStyleSheet("background: #67c23a; color: white; padding: 4px; border-radius: 4px;")
            # Capture actual dataset ID if available, otherwise use display ID
            ds_id = item.get('id', real_id) 
            btn.clicked.connect(lambda checked, i=ds_id: self.download_pdf(i))
            self.table.setCellWidget(row, 5, btn)

    def download_pdf(self, dataset_id):
        save_path, _ = QFileDialog.getSaveFileName(self, "Save Report", f"report_{dataset_id}.pdf", "PDF Files (*.pdf)")
        if not save_path: return
        
        try:
            response = requests.get(f"{API_BASE_URL}/report/{dataset_id}/", headers=self.get_headers())
            if response.status_code == 200:
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                QMessageBox.information(self, "Success", "Report downloaded successfully!")
            else:
                QMessageBox.warning(self, "Error", "Failed to generate report")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Download failed: {str(e)}")

    def update_dashboard(self, latest_data):
        # Update Cards
        self.card_total.value_label.setText(str(latest_data.get('total_equipment', '0')))
        self.card_flow.value_label.setText(f"{latest_data.get('avg_flowrate', '0')} m³/h")
        self.card_press.value_label.setText(f"{latest_data.get('avg_pressure', '0')} bar")
        self.card_temp.value_label.setText(f"{latest_data.get('avg_temperature', '0')}°C")

        # Update Type Chart
        self.canvas_types.axes.clear()
        dist = latest_data.get('type_distribution', {})
        if dist:
            labels = list(dist.keys())
            values = list(dist.values())
            colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#444444', '#aaaaaa']
            self.canvas_types.axes.bar(labels, values, color=colors[:len(labels)])
            self.canvas_types.axes.set_ylabel("Count")
            self.canvas_types.draw()

        # Update Trends Chart (Mock trends or real comparisons if available)
        self.canvas_trends.axes.clear()
        metrics = ["Flow", "Press", "Temp"]
        values = [
            latest_data.get('avg_flowrate', 0),
            latest_data.get('avg_pressure', 0),
            latest_data.get('avg_temperature', 0)
        ]
        self.canvas_trends.axes.plot(metrics, values, marker='o', linestyle='-', color='#409eff', linewidth=2)
        self.canvas_trends.axes.fill_between(metrics, values, color='#409eff', alpha=0.1)
        self.canvas_trends.draw()

    def handle_logout(self):
        self.token = None
        self.hide()
        self.login_dialog.show()

if __name__ == "__main__":
    # Log errors to a file since terminal might be hidden
    import traceback
    def exception_hook(exctype, value, tb):
        with open("error_log.txt", "a") as f:
            f.write(f"*** ERROR: {exctype} {value}\n")
            traceback.print_tb(tb, file=f)
        sys.__excepthook__(exctype, value, tb)
    
    sys.excepthook = exception_hook

    try:
        app = QApplication(sys.argv)
        
        # Set global font
        font = QFont("Segoe UI", 10)
        app.setFont(font)
        
        window = DesktopApp()
        # The window itself is hidden, but the dialog is shown
        sys.exit(app.exec_())
    except Exception as e:
        with open("error_log.txt", "a") as f:
            f.write(f"CRITICAL CRASH: {str(e)}\n")
            f.write(traceback.format_exc())
