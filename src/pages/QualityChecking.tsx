import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

export default function QualityChecking() {
  const [productType, setProductType] = useState("crop");
  const [productName, setProductName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ['qualityReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    initialData: [],
  });

  const analysisMutation = useMutation({
    mutationFn: async () => {
      if (!imageFile) throw new Error('No image file selected');

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // Remove data URL prefix
      const base64Data = base64.split(',')[1];

      const response = await fetch('/api/quality-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productType,
          productName,
          imageFile: base64Data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze quality');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['qualityReports'] });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = () => {
    if (productName && imageFile) {
      analysisMutation.mutate();
    }
  };

  const gradeColors = {
    premium: "bg-purple-100 text-purple-800 border-purple-300",
    grade_a: "bg-green-100 text-green-800 border-green-300",
    grade_b: "bg-blue-100 text-blue-800 border-blue-300",
    grade_c: "bg-yellow-100 text-yellow-800 border-yellow-300",
    reject: "bg-red-100 text-red-800 border-red-300"
  };

  const readinessColors = {
    ready: "text-green-600",
    needs_improvement: "text-yellow-600",
    not_ready: "text-red-600"
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Quality Checking
            </h1>
            <p className="text-gray-600">AI-powered visual analysis for your agricultural products</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Input Card */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Upload Product for Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs value={productType} onValueChange={setProductType}>
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="crop">🌾 Crops</TabsTrigger>
                      <TabsTrigger value="livestock">🐄 Livestock</TabsTrigger>
                      <TabsTrigger value="dairy">🥛 Dairy</TabsTrigger>
                      <TabsTrigger value="processed">📦 Processed</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <Input
                      placeholder="e.g., Tomatoes, Maize, Milk"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-500 transition-colors">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="w-full"
                          >
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600 mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-gray-400">
                            PNG, JPG up to 10MB
                          </p>
                        </label>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={!productName || !imageFile || analysisMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl py-6 text-lg"
                  >
                    {analysisMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Quality...
                      </>
                    ) : (
                      <>
                        <Award className="w-5 h-5 mr-2" />
                        Check Quality
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Card */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="border-none shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <CardTitle className="flex items-center gap-3">
                          <Award className="w-6 h-6 text-green-600" />
                          Quality Analysis Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-6">
                        {/* Grade & Score */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Quality Grade</p>
                            <Badge className={`${gradeColors[result.quality_grade]} border text-lg px-4 py-2`}>
                              {result.quality_grade.toUpperCase().replace('_', ' ')}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Quality Score</p>
                            <div className="flex items-center gap-3">
                              <Progress value={result.quality_score} className="flex-1" />
                              <span className="text-2xl font-bold text-green-600">
                                {result.quality_score}/100
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Market Readiness */}
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Market Readiness</p>
                          <p className={`text-lg font-semibold ${readinessColors[result.market_readiness]}`}>
                            {result.market_readiness.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>

                        {/* Price & Shelf Life */}
                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Estimated Price Range</p>
                            <p className="text-lg font-semibold text-gray-900">{result.estimated_price_range}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Shelf Life</p>
                            <p className="text-lg font-semibold text-gray-900">{result.shelf_life}</p>
                          </div>
                        </div>

                        {/* Quality Indicators */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Quality Indicators
                          </h4>
                          <ul className="space-y-2">
                            {result.visual_assessment.map((indicator: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                                <span>{indicator}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Defects */}
                        {result.defects_detected.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-orange-600" />
                              Defects Detected
                            </h4>
                            <ul className="space-y-2">
                              {result.defects_detected.map((defect: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-orange-700">
                                  <XCircle className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                                  <span>{defect}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommendations */}
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                          <p className="text-gray-700">{result.recommendations}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recent Reports Sidebar */}
            <div>
              <Card className="border-none shadow-lg sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Quality Checks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {reports.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">
                      No quality checks yet
                    </p>
                  ) : (
                    reports.map((report: any) => (
                      <div
                        key={report.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setResult(report)}
                      >
                        {report.image_url && (
                          <img
                            src={report.image_url}
                            alt={report.product_name}
                            className="w-full h-24 object-cover rounded-md mb-2"
                          />
                        )}
                        <p className="font-medium text-gray-900 text-sm">{report.product_name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={`${gradeColors[report.quality_grade]} border text-xs`}>
                            {report.quality_grade?.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs font-semibold text-green-600">
                            {report.quality_score}/100
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(report.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
