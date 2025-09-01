import tkinter as tk
from tkinter import ttk




class ExpandableCard(ttk.Frame):
    def __init__(self, parent, title, content, width=300, height=150):
        super().__init__(parent, relief="ridge", padding=20)

        self.expanded = False
        
        self.config(width=width, height=height)

        # Título
        self.label = ttk.Label(self, text=title, font=("Arial", 12, "bold"))
        self.label.pack(expand=True)

        style = ttk.Style()
        style.configure("Custom.TNotebook", borderwidth=0)

        self.notebook = ttk.Notebook(self, style="Custom.TNotebook", width=200)
        self.notebook.pack(fill="both", side="left")

        self.tab1 = ttk.Frame(self.notebook)
        self.notebook.add(self.tab1, text="Usuario")
        ttk.Label(self.tab1, text="Nombre",font=("Arial", 9)).pack( fill="both")
        #Variable
        ttk.Label(self.tab1, text=content[0].get(),font=("Arial", 11)).pack( fill="both")

        ttk.Label(self.tab1, text="Codigo",font=("Arial", 9)).pack( fill="both")
        #Variable
        ttk.Label(self.tab1, text=content[1].get(),font=("Arial", 11)).pack( fill="both")

        ttk.Label(self.tab1, text="Carrera",font=("Arial", 9)).pack( fill="both")
        #Variable
        ttk.Label(self.tab1, text=content[2].get(),font=("Arial", 11)).pack( fill="both")

        

        self.tab2 = ttk.Frame(self.notebook)
        self.notebook.add(self.tab2, text="Equipo")
        ttk.Label(self.tab2, text="Nombre",font=("Arial", 9)).pack( fill="both")
        
        ttk.Label(self.tab2, text=content[3].get(),font=("Arial", 11)).pack( fill="both")

        ttk.Label(self.tab2, text="Sistema",font=("Arial", 9)).pack( fill="both")
        
        ttk.Label(self.tab2, text=content[4].get(),font=("Arial", 11)).pack( fill="both")



class MainApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Simple App")
        self.resizable(0,0)
        self.state("zoomed")

        # Constantes para testeo
        NOMBRE=tk.StringVar(value="exampleName")
        CODIGO=tk.StringVar(value="exampleCode")
        CARRERA=tk.StringVar(value="exampleCareer")

        SISTEMAN = tk.StringVar(value="exampleNameSistema")
        SISTEMA = tk.StringVar(value="exampleSistema")

        # Canvas con scrollbar
        container = ttk.Frame(self)
        container.pack(fill="both", expand=True)

        canvas = tk.Canvas(container)
        scrollbar = ttk.Scrollbar(container, orient="vertical", command=canvas.yview)
        self.frame = ttk.Frame(canvas)

        self.frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=self.frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side=tk.LEFT, fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Crear cartas dinámicamente
        TOTAL = 12

        screen_width = self.frame.winfo_screenwidth()
        card_width = 300
        COLS = screen_width // card_width

        # Configurar columnas para centrar
        #COLS = 6  # cantidad de cartas por fila



        for i in range(TOTAL):
            fila = i // COLS
            col = i % COLS
            card = ExpandableCard(
                self.frame, 
                f"Equipo {i+1}", 
                [NOMBRE, CODIGO,  CARRERA, SISTEMAN, SISTEMA]
            )

            card.grid(row=fila, column=col, padx=30, pady=20, sticky="n")


if __name__ == "__main__":
    app = MainApp()
    app.mainloop()

    
