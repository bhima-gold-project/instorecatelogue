
export function formatIndianNumber(number:number) {
  const indianFormatter = new Intl.NumberFormat('en-IN');
  return indianFormatter.format(number);
}

export function formatToThreeDecimals(value:any) {
  const numericValue = parseFloat(value);

  if (isNaN(numericValue)) {
    throw new Error("Invalid input: Please provide a valid number.");
  }

  // Convert to 3 decimal places
  return numericValue.toFixed(3);
}


export const formatPrice = (price: string, decimal: boolean = false) => {
    const number = parseFloat(price);
    if (!Number.isInteger(number) || decimal) {
      return number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        style: "currency",
        currency: "INR",
      });
    } else {
      return number.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
        style: "currency",
        currency: "INR",
      });
    }
  };
  
export function getDeliveryDate(days: number) {
    var currentDate = new Date()
    var futureDate = new Date(
      currentDate.getTime() + days * 24 * 60 * 60 * 1000
    )

    var day = futureDate.getDate()
    var month = futureDate.toLocaleString("default", { month: "short" })
    var year = futureDate.getFullYear()

    return day + " " + month + " " + year
  }


    export function formatDate(dateString: string) {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, "0")
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ]
      
      const month = monthNames[date.getMonth()]
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }




