/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CloudSun, 
  MapPin, 
  Droplets, 
  Wind, 
  Sun, 
  CloudRain,
  Loader2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

const weatherCodeMap: Record<number, { icon: string; condition: string }> = {
  0: { icon: "☀️", condition: "Clear Sky" },
  1: { icon: "🌤️", condition: "Mainly Clear" },
  2: { icon: "⛅", condition: "Partly Cloudy" },
  3: { icon: "☁️", condition: "Overcast" },
  45: { icon: "🌫️", condition: "Foggy" },
  51: { icon: "🌦️", condition: "Light Drizzle" },
  61: { icon: "🌧️", condition: "Light Rain" },
  63: { icon: "🌧️", condition: "Moderate Rain" },
  65: { icon: "⛈️", condition: "Heavy Rain" },
  95: { icon: "⛈️", condition: "Thunderstorm" },
};

export default function WeatherAnalysis() {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const { data } = await supabase.auth.getSession();
        return data?.session?.user || null;
      } catch {
        return null;
      }
    },
  });

  const { data: recentAnalyses = [] } = useQuery({
    queryKey: ["weatherAnalyses"],
    queryFn: async () => {
      try {
        const res = await fetch('/api/weather-analyses?limit=5');
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const weatherMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/weather-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to analyze weather');
      }

      const body = await res.json();
      return body;
    },
    onSuccess: (data) => {
      setWeatherData(data);
      setAiAnalysis(data.aiResponse || data.analysis || data.aiResponseParsed);
      queryClient.invalidateQueries({ queryKey: ['weatherAnalyses'] });
    },
  });

  const riskColors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    moderate: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800"
  };

  const priorityIcons: Record<string, any> = {
    optimal: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    postpone: <XCircle className="w-5 h-5 text-orange-600" />,
    monitor: <AlertTriangle className="w-5 h-5 text-blue-600" />
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 lg:p-12 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Smart Weather Analysis
            </h1>
            <p className="text-gray-600">AI-powered weather insights for smart farming</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Location Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter location (e.g., Nairobi, Nakuru)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && location && weatherMutation.mutate()}
                      className="flex-1 rounded-xl"
                    />
                    <Button
                      onClick={() => weatherMutation.mutate()}
                      disabled={!location || weatherMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl"
                    >
                      {weatherMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Analyze"
                      )}
                    </Button>
                  </div>

                  {recentAnalyses.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-500">Recent:</span>
                      {recentAnalyses.map((analysis: any) => (
                        <Badge
                          key={analysis.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50"
                          onClick={() => {
                            setLocation(analysis.location);
                            setWeatherData({ 
                              locationName: analysis.location,
                              weather: { current_weather: { temperature: analysis.current_temperature, weathercode: 0, windspeed: analysis.wind_speed } },
                              forecast7day: analysis.forecast_7day
                            });
                            setAiAnalysis({
                              agricultural_impact: analysis.agricultural_impact,
                              risk_alerts: analysis.risk_alerts,
                              risk_level: 'moderate'
                            });
                          }}
                        >
                          {analysis.location}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {weatherData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h2 className="text-3xl font-bold mb-2">{weatherData.locationName}</h2>
                        <div className="text-7xl my-4">
                          {weatherCodeMap[weatherData.weather.current_weather.weathercode || 0]?.icon || '☀️'}
                        </div>
                        <p className="text-6xl font-bold mb-2">
                          {Math.round(weatherData.weather.current_weather.temperature)}°C
                        </p>
                        <p className="text-xl text-blue-100">
                          {weatherCodeMap[weatherData.weather.current_weather.weathercode || 0]?.condition}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="text-center">
                          <Wind className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm text-blue-100">Wind</p>
                          <p className="font-bold">{Math.round(weatherData.weather.current_weather.windspeed)} km/h</p>
                        </div>
                        <div className="text-center">
                          <Droplets className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm text-blue-100">Humidity</p>
                          <p className="font-bold">65%</p>
                        </div>
                        <div className="text-center">
                          <Sun className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm text-blue-100">UV Index</p>
                          <p className="font-bold">7</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {weatherData?.forecast7day && (
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>7-Day Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {weatherData.forecast7day.map((day: any, idx: number) => (
                        <div key={idx} className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-shadow">
                          <p className="font-medium text-gray-900 text-sm mb-2">
                            {idx === 0 ? 'Today' : format(new Date(day.date), 'EEE')}
                          </p>
                          <p className="text-3xl mb-2">
                            {weatherCodeMap[day.weathercode || 0]?.icon}
                          </p>
                          <p className="font-bold text-gray-900">
                            {Math.round(day.temp_max)}°
                          </p>
                          <p className="text-sm text-gray-500">
                            {Math.round(day.temp_min)}°
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            ☔ {Math.round(day.precipitation_chance)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {aiAnalysis && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          Impact on Your Farm
                        </CardTitle>
                        {aiAnalysis.risk_level && (
                          <Badge className={`${riskColors[aiAnalysis.risk_level]} text-sm px-3 py-1`}>
                            {aiAnalysis.risk_level.toUpperCase()} RISK
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {aiAnalysis.agricultural_impact}
                      </p>

                      {aiAnalysis.historical_comparison && (
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="text-sm font-medium text-gray-900 mb-1">Historical Context</p>
                          <p className="text-sm text-gray-700">{aiAnalysis.historical_comparison}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Recommended Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {aiAnalysis.recommendations?.map((rec: any, idx: number) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {priorityIcons[rec.priority] || priorityIcons.monitor}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-900">{idx + 1}. {rec.activity}</span>
                                <Badge variant="outline" className="text-xs">
                                  {rec.priority?.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                ⏰ <span className="font-medium">{rec.timing}</span>
                              </p>
                              <p className="text-sm text-gray-700">{rec.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {aiAnalysis.risk_alerts && aiAnalysis.risk_alerts.length > 0 && (
                    <Card className="border-none shadow-lg border-l-4 border-l-orange-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                          <AlertTriangle className="w-5 h-5" />
                          Weather Alerts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {aiAnalysis.risk_alerts.map((alert: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="text-orange-500 mt-1">⚠️</span>
                              <span>{alert}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </div>

            <div>
              <Card className="border-none shadow-lg sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Analyses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentAnalyses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">No analyses yet</p>
                  ) : (
                    recentAnalyses.map((analysis: any) => (
                      <div key={analysis.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setLocation(analysis.location)}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900 text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            {analysis.location}
                          </p>
                          <p className="text-xl">{weatherCodeMap[0]?.icon}</p>
                        </div>
                        <p className="text-lg font-bold text-blue-600">{Math.round(analysis.current_temperature)}°C</p>
                        <p className="text-xs text-gray-400 mt-1">{format(new Date(analysis.created_at), 'MMM d, h:mm a')}</p>
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