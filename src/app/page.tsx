"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StaticImageData } from "next/image"
import { Box, CardContent, IconButton, Input, TextField, Card, CardMedia, DialogContentText, Container, Typography, Button, Dialog, Drawer, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Chip, CircularProgress } from "@mui/material"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined"
import DeleteIcon from "@mui/icons-material/Delete"
import { styled } from "@mui/system"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import axios from "axios"
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AiAssistant from "./components/AIAssistant"


const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Mock images - replace with your actual imports
const chair = {
  src: "/chair.png",
  width: 800,
  height: 600,
} as StaticImageData

// const backgroundPattern = {
//   src: "https://dublincarpet.com/wp-content/uploads/2020/09/bigstock-An-Example-Of-A-Catalog-Of-Lux-359626954.jpg",
//   width: 300,
//   height: 300,
// } as StaticImageData

const heroImage = {
  src: "https://dublincarpet.com/wp-content/uploads/2020/09/bigstock-An-Example-Of-A-Catalog-Of-Lux-359626954.jpg",
  width: 2070,
  height: 1035,
} as StaticImageData

interface Product {
  id: number
  title: string
  description: string
  price: string
  image: string
  matchPercentage: number
  DiscountedPrice:string
  DeliveryTimeline:string
  contactInfo?: {
    name: string
    email: string
    phone: string
  }
}

interface CardItem {
  title: string
  description: string
}

interface NavItem {
  label: string
  path: string
}

const mockData: Product[] = [
  {
    id: 1,
    title: "Mapper Plus Sofa - Three Seater Reflection Rose Brown",
    description: "Comfortable, easy to assemble, and stylish modern sofa",
    price: "3998.00",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    matchPercentage: 100,
    DiscountedPrice:"2999",
    DeliveryTimeline:"usually 5-7 days",
    contactInfo: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
    },
  },
  {
    id: 2,
    title: "Mapper Plus Sofa Set - (3×2) Reflection Rose Brown",
    description: "Complete living room set with premium upholstery",
    price: "9992.00",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    DiscountedPrice:"2999",
    DeliveryTimeline:"usually 5-7 days",
    matchPercentage: 100,
    contactInfo: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1987654320",
    },
  },
  {
    id: 3,
    title: "Mapper Plus Sofa - Three Seater Reflection Mocha Brown",
    description: "Luxury sofa with premium leather finish",
    price: "3998.00",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    DiscountedPrice:"2999",
    DeliveryTimeline:"usually 5-7 days",
    matchPercentage: 100,
    contactInfo: {
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1122334455",
    },
  },
  {
    id: 4,
    title: "Modern Lounge Chair - Velvet Finish",
    description: "Elegant accent chair for any living space",
    price: "1999.00",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    matchPercentage: 95,
    DiscountedPrice:"2999",
    DeliveryTimeline:"usually 5-7 days",
    contactInfo: {
      name: "Sarah Williams",
      email: "sarah@example.com",
      phone: "+1555666777",
    },
  },
]

const cardItems: CardItem[] = [
  {
    title: "Image Search",
    description: "Upload images of Tiles you like. Our AI identifies key features and matches to similar products.",
  },
  {
    title: "Compare Options",
    description: "View pricing, delivery timelines, and customization options from our partner manufacturers.",
  },
  {
    title: "Streamlined Procurement",
    description: "Customize your selections and manage the entire procurement process through our platform.",
  },
]

const navItems: NavItem[] = [
  { label: "Discovery", path: "discovery" },
  { label: "Catalog", path: "catalog" },
  { label: "Customization", path: "customization" },
  { label: "Orders", path: "orders" },
]

const GradientBox = styled(Box)({
  background: "linear-gradient(135deg, #36536B 0%, #2a4155 100%)",
})

const FeatureCard = styled(Card)({
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
  },
})

const AnimatedButton = styled(Button)({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
})



// const data = response.data;

const ProductCard = ({ product }: { product: Product }) => {
  const [openProd, setOpenProd] = useState(false)

  const handleClickOpen = () => setOpenProd(true)
  const handleClose = () => setOpenProd(false)

  return (
    <>
      <Card
        sx={{
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #eee",
          height: "100%",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="200"
            image={product.image}
            alt={product.title}
            sx={{
              objectFit: "cover",
              width: "100%",
            }}
          />
          {product?.matchPercentage && (
            <Chip
              label={`${product.matchPercentage}% Match`}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "#000",
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.75rem",
                borderRadius: "8px",
                px: 1.5,
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5 }}>
            {product.title}
          </Typography>

          {product.description && (
  <Typography variant="body2" sx={{ color: "#555", mb: 1 }}>
    {product.description.split(" ").slice(0, 10).join(" ")}
  </Typography>
  
)}


          <Typography variant="h6"  sx={{ color: "#36536B", mb: 1 }}>
            Discounted Price: ₹{product.DiscountedPrice}

          </Typography>
          
          <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
          Actual Price: ₹{product.price}
          </Typography>
          
          <Chip 
  label={product.DeliveryTimeline ?? 'N/A'} 
  sx={{ mb: 1 }} 
/>

          <Button
            fullWidth
            onClick={handleClickOpen}
            sx={{
              backgroundColor: "#36536B",
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              py: 1,
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: "#2a4155",
              },
            }}
          >
            CONTACT US
          </Button>
        </CardContent>
      </Card>

      <Dialog open={openProd} onClose={handleClose} fullWidth>
        <DialogTitle>Contact Details</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Here are the contact details for this product:</DialogContentText>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography>
              <strong>Name:</strong> {product.contactInfo?.name || "N/A"}
            </Typography>
            <Typography>
              <strong>Email:</strong> {product.contactInfo?.email || "contact@example.com"}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {product.contactInfo?.phone || "+91 123-4567"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: "black" }}>
            Close
          </Button>
          <Button onClick={handleClose} variant="contained" sx={{ backgroundColor: "#36536B" }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [budget, setBudget] = useState("")
  const [quantity, setQuantity] = useState<number>(1)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [showProducts,setShowProducts] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  const [deliveryDay, setDeliveryDays] = useState<string>("");

  const handleScroll = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setBudget("");
    setQuantity(1);
    setDeliveryDate("");
    setShowPopup(false);
    setShowProducts(false);
    setIsLoading(false);
    setDeliveryDays("");
  };
  

  useEffect(() => {
    if (deliveryDate) {
      const currentDate = new Date();
      const targetDate = new Date(deliveryDate);
      const diffTime = targetDate.getTime() - currentDate.getTime();
      const calculatedDays = `${Math.ceil(diffTime / (1000 * 60 * 60 * 24))-1} days`;
      setDeliveryDays(calculatedDays);
    }
  }, [deliveryDate]);
  


  const handleSubmit = async () => {
    handleScroll("loading-section")
    setShowPopup(false)
    setIsLoading(true); 
        try {

      const [datePart, timePart] = deliveryDate.split('T');

      const formattedDate = {
        date: new Date(deliveryDate).toISOString(), // convert to ISO format
        time: new Date().toTimeString().split(' ')[0], // current time as HH:MM:SS
      };
       
  //     const currentDate = new Date();
  // const targetDate = new Date(datePart); // Only the date part
  // const diffTime = targetDate.getTime() - currentDate.getTime(); // Convert to milliseconds
  // const deliveryDays = `${Math.ceil(diffTime / (1000 * 60 * 60 * 24))-1} days`;
      

       console.log("date:",formattedDate)
      const formData={
        ['File upload']:selectedFile,
        Budget:budget,
        Quantity:quantity,
        ['Delivery Date']: JSON.stringify(formattedDate),
        ['Delivery Days']:deliveryDay
      }
      const token = 'd63b421612cf4c04b8ddf19377976b01';
      const response = await axios.post(
        `${API_URL}/api/user/service/67f752b21a3df692a93879ab`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`  // Include the Authorization header

          },
        }
      );
      console.log("Success:", response.data);

    const id = response?.data?._id;

    if (!id) {
      console.error("No ID returned from the response.");
      return;
    }

    console.log("ID from response:", id);
       if(response){

      let pass=null
    
        const dataResponse = await axios.get(`${API_URL}/api/user/service/data/67f752b21a3df692a93879ab/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`  
          }
        });
       console.log("Data fetched:", dataResponse);

       

      if (dataResponse.data && dataResponse.data.data && dataResponse.data.data["Recommended Product"]) {
        const apiProducts = dataResponse.data.data["Recommended Product"].map((apiProduct: any, index: number) => ({
          id: index + 1,
          title: apiProduct["Product Title"],
          description: apiProduct.Description,
          price: apiProduct["Full Price (SAR)"],
          image: apiProduct["Product Url"],
          matchPercentage: 100,
          DiscountedPrice: apiProduct['Discounted Price'],
          DeliveryTimeline: apiProduct['Delivery Timeline'],
          
          

          contactInfo: {
            name: "Sales Representative", 
            email: "sales@example.com", 
            phone: "+1234567890"
          }
        }));
        
        setRecommendedProducts(apiProducts);
      }
    }

    } catch (error) {
      console.error("Error uploading:", error);
    }finally {
      setIsLoading(false); 
      setShowProducts(true);
    }
  };


 

  
 

  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }
  const drawer = (
    <div className="p-4">
      <div className="flex justify-end">
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </div>
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.label}
            onClick={() => handleScroll(item.path)}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(54, 83, 107, 0.1)",
              },
              cursor: "pointer",
              py: 2,
            }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: 500,
                color: "#36536B",
              }}
            />
          </ListItem>
        ))}
        <ListItem sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            fullWidth
            onClick={() => {
              // router.push("/signin")
              setMobileOpen(false)
            }}
            variant="outlined"
            sx={{
              borderColor: "#36536B",
              color: "#36536B",
              fontWeight: 600,
              py: 1.5,
              borderRadius: "8px",
              mt: 2,
              "&:hover": {
                borderColor: "#2a4155",
                backgroundColor: "rgba(54, 83, 107, 0.05)",
              },
            }}
          >
            Sign In
          </Button>
        </ListItem>
      </List>
    </div>
  )

  const handleProceed = () => {
    setShowPopup(true)
  }

  const onClose = () => setShowPopup(false)

  const handleConfirm = () => {
    setShowPopup(false)
    setShowProducts(true)
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancel = () => {
    setPreviewImage(null)
    setSelectedFile(null)
    setBudget("")
    setQuantity(1)
    setDeliveryDate("")
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  
  
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>(mockData); // Initialize with mockData


  return (
    <>
      <header className="fixed top-0 w-full bg-white shadow-sm font-serif z-50 backdrop-blur-sm bg-opacity-90">
        <Container maxWidth="xl">
          <div className="flex justify-between items-center p-4">
            <h1 className="font-bold text-2xl text-[#36536B] cursor-pointer" onClick={() => router.push("/")}>
              MatBook
            </h1>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <div className="flex gap-6">
                {navItems.map((item) => (
                  <Button key={item?.label} onClick={() => handleScroll(item?.path)}  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: '#36536B',
                    },
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'color 0.3s ease-in-out', 
                    textTransform: 'none', 
                  }}>
                    {item.label}
                  </Button>
                ))}
              
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <Button
                className="hidden md:block"
                onClick={() => router.push("/signin")}
                variant="outlined"
                sx={{
                  borderColor: "#36536B",
                  color: "#36536B",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: "8px",
                  "&:hover": {
                    borderColor: "#2a4155",
                    backgroundColor: "rgba(54, 83, 107, 0.05)",
                  },
                }}
              >
                Sign In
              </Button>

              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} className="md:hidden" sx={{ color: "#36536B", display: { xs: "block", md: "none" } }}>
                <MenuIcon />
              </IconButton>
            </div>
          </div>
        </Container>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: { xs: "80%", sm: "60%" },
            },
          }}
        >
          {drawer}
        </Drawer>
      </header>

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "500px", md: "800px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
          background: `linear-gradient(rgba(54, 83, 107, 0.2), rgba(54, 83, 107, 0.2)), url(${heroImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mt: "64px",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              lineHeight: 1.2,
            }}
          >
            Discover Perfect Tiles with AI
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontWeight: 400,
              opacity: 0.9,
            }}
          >
            Upload a photo and we'll find the closest matches with real-time pricing from our partner manufacturers.
          </Typography>
          <AnimatedButton
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "white",
              color: "#36536B",
              fontWeight: 700,
              px: 5,
              py: 1.5,
              fontSize: "1.1rem",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.9)",
              },
            }}
            onClick={() => handleScroll("discovery")}
          >
            Try It Now
          </AnimatedButton>
        </Container>
      </Box>
      <GradientBox id="catalog" sx={{ py: 10,mt:5,mx:5,borderRadius:2}}>  
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              textAlign: "center",
              color: "white",
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: "rgba(255,255,255,0.8)",
              mb: 6,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Our AI-powered platform connects you with the perfect furniture for your projects
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 4 }}>
            {cardItems.map((item, index) => (
              <FeatureCard key={index} sx={{ p: 4, textAlign: "center", backgroundColor: "white" }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: "#36536B",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#36536B" }}>
                  {item.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {item.description}
                </Typography>
              </FeatureCard>
            ))}
          </Box>
        </Container>
      </GradientBox>

   

      {/* Call to action */}
      <Box
        id="customization"
        sx={{
          py: 10,
          background: "linear-gradient(135deg, rgba(54,83,107,0.05) 0%, rgba(255,255,255,1) 100%)",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: "#36536B",
            }}
          >
            Ready to Simplify Your Tiles Sourcing?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 6,
              color: "text.secondary",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Create an account to unlock full access to pricing, customization, and procurement tools.
          </Typography>
          <Box sx={{ display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
            <AnimatedButton
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#36536B",
                color: "white",
                fontWeight: 600,
                px: 5,
                py: 1.5,
                "&:hover": {
                  backgroundColor: "#2a4155",
                },
              }}
              onClick={() => router.push("/signup")}
            >
              Create Free Account
            </AnimatedButton>
            <AnimatedButton
              variant="outlined"
              size="large"
              sx={{
                borderColor: "#36536B",
                color: "#36536B",
                fontWeight: 600,
                px: 5,
                py: 1.5,
                "&:hover": {
                  borderColor: "#2a4155",
                  backgroundColor: "rgba(54, 83, 107, 0.05)",
                },
              }}
              onClick={() => router.push("/about")}
            >
              Learn More
            </AnimatedButton>
          </Box>
        </Container>
      </Box>

      {/* AI Assistant */}
      <AiAssistant />

      {/* Footer */}
      <Box
        sx={{
          py: 5,
          backgroundColor: "#2a4155",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: { xs: 3, md: 0 } }}>
              MatBook
            </Typography>
            <Box sx={{ display: "flex", gap: 4 }}>
              {navItems.map((item) => (
                <Typography
                  key={item.label}
                  variant="body1"
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={() => handleScroll(item.path)}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 4, textAlign: "center", opacity: 0.7 }}>
            © {new Date().getFullYear()} MatBook. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Confirmation Popup */}
      <Dialog open={showPopup} onClose={onClose} fullWidth maxWidth="sm">
        <Box sx={{ p: 3 }}>
          <DialogTitle
            sx={{
              fontSize: "1.5rem",
              fontWeight: 600,
              textAlign: "center",
              px: 0,
              color: "#36536B",
            }}
          >
            Confirm Your Request
          </DialogTitle>

          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 3,
            }}
          >
            Do you want to proceed further with your request?
            <br />
            Below is the Requirement of you!!!
          </Typography>

          <DialogContent
            sx={{
              borderTop: "1px solid #eee",
              borderBottom: "1px solid #eee",
              py: 3,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2,
              }}
            >
              <Typography variant="body1">
                <strong>Budget:</strong>
              </Typography>
              <Typography variant="body1">${budget || "N/A"}</Typography>

              <Typography variant="body1">
                <strong>Quantity:</strong>
              </Typography>
              <Typography variant="body1">{quantity || "N/A"}</Typography>

              <Typography variant="body1">
                <strong>Delivery Date:</strong>
              </Typography>
              <Typography variant="body1">{deliveryDate || "N/A"}</Typography>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              justifyContent: "center",
              pt: 3,
              px: 0,
            }}
          >
            <AnimatedButton
              onClick={onClose}
              variant="outlined"
              sx={{
                minWidth: 120,
                borderColor: "grey.400",
                color: "text.primary",
                "&:hover": { borderColor: "grey.600" },
              }}
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              variant="contained"
              sx={{
                minWidth: 120,
                backgroundColor: "#36536B",
                "&:hover": { backgroundColor: "#2a4155" },
                ml: 2,
                color: "white",
              }}
              onClick={handleSubmit}
            >
              Confirm
            </AnimatedButton>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  )
}
