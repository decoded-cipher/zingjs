export default {
    GET: (req) => {
      const num1 = parseInt(req.query.num1, 10);
      const num2 = parseInt(req.query.num2, 10);
  
      if (isNaN(num1) || isNaN(num2)) {
        return { error: "Invalid numbers provided" };
      }
  
      return { sum: num1 + num2 };
    }
  };
  