import Student from '@inventores/api/dist/student/index.js';

export const getData = async(code) => {
  const api = new Student(process.env.TOKEN);

  try {
    const student = await api.data(code);
    
    if (!student) return { ok: false, message: "No se encontró el estudiante" };
    
    return {
        ok: true,
        data: student
    };

  } catch (error) {
    
    return {
        ok: false,
        message: error
    };
  }
};

export default getData;
