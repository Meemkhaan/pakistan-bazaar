import { useState } from "react";
import { Package, Upload, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";

const Returns = () => {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [returnReason, setReturnReason] = useState("");

  // Mock order data
  const eligibleOrders = [
    {
      id: "ORD-001",
      date: "2024-01-10",
      status: "delivered",
      items: [
        {
          id: "1",
          name: "Samsung Galaxy A54 5G - 128GB Storage",
          price: 89999,
          image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100",
          returnEligible: true,
          daysLeft: 35
        }
      ],
      total: 89999
    },
    {
      id: "ORD-002", 
      date: "2024-01-08",
      status: "delivered",
      items: [
        {
          id: "2",
          name: "Nike Air Force 1 Original White Sneakers",
          price: 12500,
          image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100",
          returnEligible: true,
          daysLeft: 33
        }
      ],
      total: 25000
    }
  ];

  // Mock return requests
  const returnRequests = [
    {
      id: "RET-001",
      orderId: "ORD-003",
      productName: "HP Pavilion 15.6\" Laptop",
      reason: "Product not as described",
      status: "approved",
      requestDate: "2024-01-12",
      refundAmount: 145000,
      estimatedRefund: "2024-01-18"
    },
    {
      id: "RET-002",
      orderId: "ORD-004", 
      productName: "Philips Air Fryer XXL",
      reason: "Defective product",
      status: "in_progress",
      requestDate: "2024-01-14",
      refundAmount: 35000,
      estimatedRefund: "2024-01-20"
    },
    {
      id: "RET-003",
      orderId: "ORD-005",
      productName: "Adidas Ultraboost Shoes",
      reason: "Wrong size delivered",
      status: "pending",
      requestDate: "2024-01-15",
      refundAmount: 18500,
      estimatedRefund: "2024-01-22"
    }
  ];

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-orange-100 text-orange-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress": return <Clock className="w-4 h-4 text-blue-600" />;
      case "pending": return <Clock className="w-4 h-4 text-orange-600" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleSubmitReturn = () => {
    // Here you would submit the return request to your Laravel API
    console.log("Submitting return request:", {
      orderId: selectedOrder,
      reason: returnReason
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Returns & Refunds</h1>
            <p className="text-muted-foreground">Manage your returns with our 40-day policy</p>
          </div>
        </div>

        <Tabs defaultValue="new-return" className="space-y-6">
          <TabsList>
            <TabsTrigger value="new-return">New Return</TabsTrigger>
            <TabsTrigger value="my-returns">My Returns</TabsTrigger>
            <TabsTrigger value="policy">Return Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="new-return">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Return Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Initiate Return Request
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Select Order */}
                    <div>
                      <Label className="text-base font-medium mb-4 block">
                        Select Order to Return
                      </Label>
                      <RadioGroup value={selectedOrder} onValueChange={setSelectedOrder}>
                        {eligibleOrders.map((order) => (
                          <div key={order.id} className="space-y-3">
                            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                              <RadioGroupItem value={order.id} id={order.id} />
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <Label htmlFor={order.id} className="text-base font-medium">
                                      Order {order.id}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      Placed on {order.date} • {formatPrice(order.total)}
                                    </p>
                                  </div>
                                  <Badge className="bg-green-100 text-green-800">
                                    {order.items[0].daysLeft} days left
                                  </Badge>
                                </div>
                                
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 mt-3">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                    <div>
                                      <p className="text-sm font-medium">{item.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatPrice(item.price)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Return Reason */}
                    {selectedOrder && (
                      <div>
                        <Label className="text-base font-medium mb-4 block">
                          Reason for Return
                        </Label>
                        <RadioGroup value={returnReason} onValueChange={setReturnReason}>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="defective" id="defective" />
                              <Label htmlFor="defective">Product is defective or damaged</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wrong_item" id="wrong_item" />
                              <Label htmlFor="wrong_item">Wrong item received</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="not_described" id="not_described" />
                              <Label htmlFor="not_described">Product not as described</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wrong_size" id="wrong_size" />
                              <Label htmlFor="wrong_size">Wrong size/color</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="not_needed" id="not_needed" />
                              <Label htmlFor="not_needed">No longer needed</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other">Other reason</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* Additional Details */}
                    {returnReason && (
                      <div>
                        <Label htmlFor="details">Additional Details</Label>
                        <Textarea
                          id="details"
                          placeholder="Please provide more details about the issue..."
                          rows={4}
                        />
                      </div>
                    )}

                    {/* Photo Upload */}
                    {returnReason && (
                      <div>
                        <Label>Upload Photos (Optional)</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mt-2">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-2">
                            Upload photos of the product to help us process your return faster
                          </p>
                          <Button variant="outline" size="sm">
                            Choose Photos
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    {selectedOrder && returnReason && (
                      <Button
                        onClick={handleSubmitReturn}
                        className="w-full bg-gradient-primary"
                        size="lg"
                      >
                        Submit Return Request
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Return Policy Summary */}
              <div>
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Return Policy Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>40-day return window from delivery</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Free return pickup across Pakistan</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Full refund for eligible returns</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>7-14 days processing time</span>
                      </div>
                    </div>
                    
                    <hr className="border-border" />
                    
                    <div>
                      <h4 className="font-medium mb-2">Return Process:</h4>
                      <ol className="text-sm space-y-1 text-muted-foreground">
                        <li>1. Submit return request</li>
                        <li>2. Await approval (24-48 hours)</li>
                        <li>3. Package pickup scheduled</li>
                        <li>4. Item inspection</li>
                        <li>5. Refund processed</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-returns">
            <div className="space-y-6">
              {returnRequests.map((returnReq) => (
                <Card key={returnReq.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">Return {returnReq.id}</h3>
                          <Badge className={getStatusColor(returnReq.status)}>
                            {getStatusIcon(returnReq.status)}
                            <span className="ml-1 capitalize">{returnReq.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Order {returnReq.orderId} • Requested on {returnReq.requestDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(returnReq.refundAmount)}</p>
                        <p className="text-sm text-muted-foreground">Refund Amount</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">{returnReq.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Reason: {returnReq.reason}
                      </p>
                    </div>

                    {returnReq.status === "approved" && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-800">
                          ✓ Return approved! Your refund will be processed by {returnReq.estimatedRefund}
                        </p>
                      </div>
                    )}

                    {returnReq.status === "in_progress" && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          📦 Your return is being processed. Expected completion: {returnReq.estimatedRefund}
                        </p>
                      </div>
                    )}

                    {returnReq.status === "pending" && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-orange-800">
                          ⏳ Your return request is under review. We'll update you within 24-48 hours.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policy">
            <Card>
              <CardHeader>
                <CardTitle>Return Policy Details</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">40-Day Return Policy</h3>
                    <p className="text-muted-foreground mb-4">
                      At ShopPakistan, we offer a generous 40-day return policy to ensure your complete satisfaction.
                    </p>
                    
                    <h4 className="font-medium mb-2">Eligible Items:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Items in original condition with tags/packaging</li>
                      <li>• Electronics with all accessories and documentation</li>
                      <li>• Fashion items unworn and in original packaging</li>
                      <li>• Home goods in unused condition</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Non-Returnable Items:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Personal care items (opened)</li>
                      <li>• Custom or personalized items</li>
                      <li>• Software/digital downloads</li>
                      <li>• Items damaged by misuse</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Return Process Timeline:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Return request submission</span>
                        <span className="text-muted-foreground">Instant</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Request review & approval</span>
                        <span className="text-muted-foreground">24-48 hours</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Pickup scheduling</span>
                        <span className="text-muted-foreground">1-2 days</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Item inspection</span>
                        <span className="text-muted-foreground">2-3 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refund processing</span>
                        <span className="text-muted-foreground">3-7 days</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Refund Methods:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Original payment method (for card/online payments)</li>
                      <li>• Bank transfer (for cash on delivery orders)</li>
                      <li>• Store credit (upon request)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Returns;